import * as https from "https";
import PQueue from "p-queue";
import { fileTypeFromBuffer } from "file-type";
import { eLog } from "../libs/lib";
import { LIMIT_TELEGRAM_FILE_SIZE } from "../constants";
import controller_telegram from "./controller_telegram";
import FileStore, { IFileStore } from "../models/model_file_store";
import { ScanFileProps } from "../interface";
import controller_redis from "./controller_redis";

const CONFIG = {
    BLOCKED_EXTENSIONS: new Set(["exe", "msi", "apk", "cab", "deb", "rpm", "bat", "cmd", "sh", "scr", "vbs"]),
    SCAN_BYTES: 4100,
    TIMEOUT_MS: 10000,
    MAX_RETRIES: 3,
    RETRY_DELAY_MS: 1000,
    QUEUE: { concurrency: 1, interval: 500, intervalCap: 2 }
};

interface ScanResult {
    isSafe: boolean;
    reason?: string;
}

const agent = new https.Agent({
    keepAlive: true,
    maxSockets: 20,
    timeout: CONFIG.TIMEOUT_MS,
});

class BotProcessorImg {
    private queues = new Map<string, PQueue>();
    private processingFiles = new Set<string>();

    public async addTask(option: ScanFileProps): Promise<void> {
        try {
            if (!option?.user_id || !option?.chat_id || !option?.message_id) return;

            const { user_id, chat_id, message_id } = option;

            const doc = await FileStore.findOne({
                user_id,
                telegram_chat_id: chat_id,
                telegram_message_id: message_id
            }).select('_id telegram_file_id file_name file_size telegram_chat_id telegram_message_id').lean();

            if (!doc || !doc.telegram_file_id) return;
            if (this.processingFiles.has(doc.telegram_file_id)) {
                return;
            }
            if (!this.queues.has(user_id)) {
                this.queues.set(user_id, new PQueue(CONFIG.QUEUE));
            }
            const queue = this.queues.get(user_id)!;

            this.processingFiles.add(doc.telegram_file_id);

            queue.add(async () => {
                try {
                    await this.processFile(doc as IFileStore, user_id);
                } finally {
                    this.processingFiles.delete(doc.telegram_file_id!);
                    this.cleanupQueue(user_id);
                }
            });
        } catch (err) {
            eLog(`[BotImg] AddTask Error: ${(err as Error).message}`);
        }
    }

    private cleanupQueue(userId: string) {
        const queue = this.queues.get(userId);
        if (queue && queue.size === 0 && queue.pending === 0) {
            this.queues.delete(userId);
        }
    }

    private async processFile(doc: IFileStore, userId: string): Promise<void> {
        const fileId = doc.telegram_file_id!;
        const fileName = doc.file_name || "unknown";

        try {
            if (doc.file_size && doc.file_size > LIMIT_TELEGRAM_FILE_SIZE) {
                return;
            }

            const fileUrlData = await controller_telegram.get_file_link(userId, fileId);
            const fileUrl = this.extractUrl(fileUrlData);
            if (!fileUrl) {
                eLog(`[BotImg] Could not resolve URL for ${fileName}`);
                return;
            }
            eLog(`[BotImg] Scanning header: ${fileName}`);
            const buffer = await this.downloadHeaderSafe(fileUrl);

            if (!buffer) {
                return;
            }

            const scanResult = await this.analyzeBuffer(buffer);
            if (!scanResult.isSafe) {
                eLog(`[BotImg] ❌ UNSAFE DETECTED (${scanResult.reason}): ${fileName}`);
                await this.handleUnsafeFile(doc, userId);
            } else {
                eLog(`[BotImg] ✅ File safe: ${fileName}`);
            }
        } catch (error) {
            eLog(`[BotImg] Worker Error (${fileName}):`, error);
        }
    }

    private async downloadHeaderSafe(url: string): Promise<Buffer | null> {
        let attempt = 0;
        while (attempt < CONFIG.MAX_RETRIES) {
            try {
                return await this.fetchBytes(url);
            } catch (error) {
                attempt++;
                const isLast = attempt === CONFIG.MAX_RETRIES;
                const msg = error instanceof Error ? error.message : String(error);
                if (msg.includes("404")) return null;
                if (!isLast) {
                    const delay = CONFIG.RETRY_DELAY_MS * attempt;
                    await new Promise(r => setTimeout(r, delay));
                } else {
                    eLog(`[BotImg] Failed to download ${url} after ${attempt} attempts: ${msg}`);
                }
            }
        }
        return null;
    }

    private fetchBytes(url: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const req = https.get(url, {
                agent,
                headers: { Range: `bytes=0-${CONFIG.SCAN_BYTES}` },
                timeout: CONFIG.TIMEOUT_MS,
            }, (res) => {
                const code = res.statusCode ?? 0;
                if (code >= 300 && code < 400) {
                    res.destroy();
                    return reject(new Error(`Redirect not allowed: HTTP ${code}`));
                }
                if (code === 404) {
                    res.destroy();
                    return reject(new Error("404 Not Found"));
                }
                if (![200, 206].includes(code)) {
                    res.destroy();
                    return reject(new Error(`HTTP ${code}`));
                }
                const chunks: Buffer[] = [];
                let total = 0;

                res.on("data", (chunk: Buffer) => {
                    total += chunk.length;
                    if (total > CONFIG.SCAN_BYTES) {
                        const allowed = chunk.subarray(0, chunk.length - (total - CONFIG.SCAN_BYTES));
                        if (allowed.length) chunks.push(allowed);
                        res.destroy();
                        return;
                    }
                    chunks.push(chunk);
                });

                res.on("end", () => resolve(Buffer.concat(chunks)));
                res.on("error", reject);
            });

            req.on("timeout", () => {
                req.destroy();
                reject(new Error("Request Timeout"));
            });
            req.on("error", reject);
        });
    }

    private async analyzeBuffer(buffer: Buffer): Promise<ScanResult> {
        if (!buffer || buffer.length === 0) {
            return { isSafe: false, reason: "Empty Buffer" };
        }

        if (buffer.length >= 2) {
            const magic = buffer.toString("ascii", 0, 2);
            if (magic === "MZ") {
                return { isSafe: false, reason: "Executable Header (MZ)" };
            }
        }

        try {
            const type = await fileTypeFromBuffer(buffer);
            if (!type) return { isSafe: true };

            if (CONFIG.BLOCKED_EXTENSIONS.has(type.ext)) {
                return { isSafe: false, reason: `Blocked Extension: ${type.ext}` };
            }
            return { isSafe: true };
        } catch (err) {
            eLog("[BotImg] Analysis Error", err);
            return { isSafe: false, reason: "Analysis Failed" };
        }
    }

    private async handleUnsafeFile(doc: IFileStore, userId: string): Promise<void> {
        try {
            await controller_redis.publish("delete_message", {
                user_id: userId,
                chat_id: doc.telegram_chat_id,
                message_id: doc.telegram_message_id
            });
            await FileStore.deleteOne({ _id: doc._id });
        } catch (err) {
            eLog(`[BotImg] Failed to cleanup unsafe file ${doc._id}:`, err);
        }
    }

    private extractUrl(data: any): string | null {
        if (typeof data === 'string') return data;
        if (data?.file_path) return data.file_path;
        if (data?.url) return data.url;
        return null;
    }
}

export default new BotProcessorImg();