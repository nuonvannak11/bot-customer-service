import * as https from "https";
import PQueue from "p-queue";
import { fileTypeFromBuffer } from "file-type";
import { eLog } from "../utils/util";
import { LIMIT_TELEGRAM_FILE_SIZE } from "../constants";
import { ProtectController } from "../controller/controller_protect";
import controller_telegram from "./controller_telegram";
import { IFileStore } from "../models/model_file_store";
import FileStore from "../models/model_file_store";
import { VirusAlert } from "../interface";
import controller_redis from "./controller_redis";

const BLOCKED_FILE_TYPES = ["exe", "msi", "apk", "cab", "deb", "rpm", "bat", "cmd", "sh"];
const SCAN_BUFFER_SIZE = 4100;
const REQUEST_TIMEOUT_MS = 10000;
const QUEUE_CONFIG = { concurrency: 1, interval: 1000, intervalCap: 2 };
const RETRY_CONFIG = { maxRetries: 6, baseDelay: 600 };

class BotProcessorImg extends ProtectController {
    private queues = new Map<string, PQueue>();
    private process = new Map<string, boolean>();

    public async addTask(option: VirusAlert) {
        try {
            if (!option?.user_id || !option?.chat_id || !option?.message_id) return;
            const { user_id, chat_id, message_id } = option;
            const doc = await FileStore.findOne({ user_id, telegram_chat_id: chat_id, telegram_message_id: message_id }).lean();
            if (!doc) return;

            if (!this.queues.has(user_id)) {
                this.queues.set(user_id, new PQueue(QUEUE_CONFIG));
                eLog(`[Queue] Created group queue for ${user_id}`);
            }
            const queue = this.queues.get(user_id);
            if (!queue) return;
            const uniqueId = doc.telegram_file_id;
            if (!uniqueId) return;
            if (this.process.has(uniqueId)) {
                eLog(`[Worker] File ${uniqueId} already processing`);
                return;
            }
            this.process.set(uniqueId, true);
            queue.add(() =>
                this.worker(doc, user_id)
                    .catch(err => {
                        eLog(`[Worker] Error user ${user_id}:`, err);
                    })
                    .finally(() => {
                        this.process.delete(uniqueId);
                        if (queue.size === 0 && queue.pending === 0) {
                            this.queues.delete(user_id);
                            eLog(`[Queue] Cleaned idle queue for ${user_id}`);
                        }
                    })
            );
        } catch (err) {
            eLog(err);
        }
    }

    public async protect_buffer(buffer: Buffer, blockedTypes: string[] = BLOCKED_FILE_TYPES, checkMagic = false): Promise<{ status: boolean; message: string; ext?: string }> {
        try {
            if (!buffer || buffer.length === 0) return { status: false, message: "Missing file data" };
            if (checkMagic && buffer.length >= 2) {
                const magicBytes = buffer.toString("ascii", 0, 2);
                if (magicBytes === "MZ") return { status: true, message: "Executable disguised as safe file" };
            }
            const detected = await fileTypeFromBuffer(buffer);
            if (!detected?.ext) return { status: false, message: "Unknown or dangerous file" };
            if (blockedTypes.includes(detected.ext)) return { status: true, message: `Blocked file type: ${detected.ext}` };
            return { status: false, message: "File safe", ext: detected.ext };
        } catch (error) {
            eLog("[Protect] Error analyzing buffer:", error);
            return { status: false, message: "Error analyzing file" };
        }
    }

    private async worker(doc: IFileStore, user_id: string): Promise<void> {
        try {
            if (!doc?._id || !doc?.telegram_file_id) return;
            const fileName = doc.file_name || "unknown";
            if (doc.file_size && doc.file_size > LIMIT_TELEGRAM_FILE_SIZE) {
                eLog(`[Worker] File too large — skipping: ${fileName}`);
                return;
            }
            const fileUrlData = await controller_telegram.get_file_link(user_id, doc.telegram_file_id);
            if (!fileUrlData) return;
            const fileUrl = typeof fileUrlData === 'string' ? fileUrlData : fileUrlData?.file_path || fileUrlData?.url;
            if (!fileUrl || typeof fileUrl !== 'string') return;
            eLog(`[Worker] Scanning: ${fileName}`);
            const scanResult = await this.scanFileHeader(fileUrl);
            if (scanResult.status) {
                const publishResult = await controller_redis.publish("delete_message", {
                    user_id,
                    chat_id: doc.telegram_chat_id,
                    message_id: doc.telegram_message_id
                });
                if (!publishResult) return;
                const deleteResult = await FileStore.deleteOne({ _id: doc._id });
                if (!deleteResult) return;
                eLog(`[Worker] ❌ File unsafe: ${fileName}`);
            } else {
                eLog(`[Worker] ✅ File safe: ${fileName}`);
            }
        } catch (error) {
            eLog("[Worker] Error processing file:", error);
        }
    }

    private async scanFileHeader(url: string, maxRetries = RETRY_CONFIG.maxRetries): Promise<{ status: boolean; message: string }> {
        return new Promise((resolve) => {
            let retries = maxRetries;
            const attempt = () => {
                let timeout: ReturnType<typeof setTimeout> | undefined;
                try {
                    const options = { headers: { Range: `bytes=0-${SCAN_BUFFER_SIZE}` } };
                    const req = https.get(url, options, (res) => {
                        if (timeout) clearTimeout(timeout);
                        if (res.statusCode === 404) {
                            if (retries > 0) {
                                retries--;
                                const delay = (maxRetries - retries) * RETRY_CONFIG.baseDelay;
                                eLog(`[Scanner] ⏳ Retrying in ${delay}ms...`);
                                setTimeout(attempt, delay);
                                return;
                            }
                            return resolve({ status: false, message: "File missing on Telegram cloud" });
                        }
                        if (![200, 206].includes(res.statusCode || 0)) {
                            res.destroy();
                            return resolve({ status: false, message: `HTTP Error ${res.statusCode}` });
                        }
                        const chunks: Buffer[] = [];
                        let totalSize = 0;
                        res.on("data", (chunk) => {
                            chunks.push(chunk);
                            totalSize += chunk.length;
                            if (totalSize >= LIMIT_TELEGRAM_FILE_SIZE) res.destroy();
                        });
                        res.on("end", async () => {
                            try {
                                const buffer = Buffer.concat(chunks);
                                const result = await this.protect_buffer(buffer, BLOCKED_FILE_TYPES, true);
                                resolve(result.status ? { status: true, message: "Blocked file" } : { status: false, message: "File safe" });
                            } catch (error) {
                                resolve({ status: false, message: "Error analyzing file" });
                            }
                        });
                        res.on("error", () => resolve({ status: false, message: "Error scanning file" }));
                    });
                    timeout = setTimeout(() => {
                        req.destroy();
                        resolve({ status: false, message: "Request timeout" });
                    }, REQUEST_TIMEOUT_MS);
                    req.on("error", () => {
                        if (timeout) clearTimeout(timeout);
                        resolve({ status: false, message: "Request failed" });
                    });
                } catch (error) {
                    if (timeout) clearTimeout(timeout);
                    resolve({ status: false, message: "Unexpected error" });
                }
            };
            attempt();
        });
    }
}

export default new BotProcessorImg();
