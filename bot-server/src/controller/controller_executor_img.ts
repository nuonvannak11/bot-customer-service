import { Context } from "grammy";
import https from "https";
import { IncomingMessage } from "http";
import PQueue from "p-queue";
import { eLog } from "../utils/util";
import { API_TELEGRAM, LIMIT_TELEGRAM_FILE_SIZE } from "../constants";
import { ProtectController } from "../controller/controller_protect";
import { BotSettingDTO } from "../interface";

interface DocumentInfo {
    file_id: string;
    file_unique_id: string;
    file_name?: string;
    file_size?: number;
}

interface ScanResult {
    status: boolean;
    message: string;
}
const QUEUE_CONFIG = { concurrency: 1, interval: 1000, intervalCap: 2 };

class ExecutorImgController extends ProtectController {

    private queues = new Map<string, PQueue>();
    private processingFiles = new Set<string>();

    public addTask(
        ctx: Context,
        doc: DocumentInfo,
        user_id: string,
        badExts: string[],
        settings_bot: BotSettingDTO
    ): void {
        if (!user_id || !this.isValidDocument(doc)) return;
        this.ensureUserQueue(user_id);
        const queue = this.queues.get(user_id)!;

        if (this.processingFiles.has(doc.file_unique_id)) {
            eLog(`[Worker] File ${doc.file_unique_id} already processing`);
            return;
        }
        this.processingFiles.add(doc.file_unique_id);
        queue.add(() => this.processDocument(ctx, doc, user_id, badExts, settings_bot));
    }

    private isValidDocument(doc: DocumentInfo): boolean {
        return Boolean(doc.file_id && doc.file_unique_id);
    }

    private ensureUserQueue(user_id: string): void {
        if (!this.queues.has(user_id)) {
            this.queues.set(user_id, new PQueue(QUEUE_CONFIG));
            eLog(`[Queue] Created group queue for ${user_id}`);
        }
    }

    private async processDocument(
        ctx: Context,
        doc: DocumentInfo,
        user_id: string,
        badExts: string[],
        settings_bot: BotSettingDTO
    ): Promise<void> {
        try {
            await this.worker(ctx, doc, badExts, settings_bot);
        } catch (error) {
            eLog(`[Worker] Error processing file for user ${user_id}:`, error);
        } finally {
            this.processingFiles.delete(doc.file_unique_id);
            this.cleanupIdleQueue(user_id);
        }
    }

    private cleanupIdleQueue(user_id: string): void {
        const queue = this.queues.get(user_id);
        if (queue && queue.size === 0 && queue.pending === 0) {
            this.queues.delete(user_id);
            eLog(`[Queue] Cleaned idle queue for ${user_id}`);
        }
    }

    private async worker(
        ctx: Context,
        doc: DocumentInfo,
        badExts: string[],
        settings_bot: BotSettingDTO
    ): Promise<void> {
        const fileName = doc.file_name || "unknown";
        if (doc.file_size && doc.file_size > LIMIT_TELEGRAM_FILE_SIZE) {
            eLog(`[Worker] File too large — skipping: ${fileName}`);
            return;
        }
        const fileInfo = await ctx.api.getFile(doc.file_id);
        if (!fileInfo.file_path) {
            eLog(`[Worker] Could not retrieve file path: ${fileName}`);
            return;
        }
        const fileUrl = `${API_TELEGRAM}/file/bot${ctx.api.token}/${fileInfo.file_path}`;
        eLog(`[Worker] Scanning Cloud: ${fileUrl}`);

        const scanResult = await this.scanFileHeader(fileUrl, badExts, settings_bot);
        if (scanResult.status) {
            await this.handleBlockedFile(ctx, fileName);
        } else {
            eLog(`[Worker] ✅ File clean: ${fileName}`);
        }
    }

    private async handleBlockedFile(ctx: Context, fileName: string): Promise<void> {
        try {
            await ctx.deleteMessage().catch(() => {
                eLog(`[Worker] Could not delete message`);
            });
            eLog(`[Worker] Deleted message containing blocked file: ${fileName}`);
        } catch (error) {
            eLog(`[Worker] Error handling blocked file:`, error);
        }
    }

    private async scanFileHeader(url: string, badExts: string[], settings_bot: BotSettingDTO): Promise<ScanResult> {
        return this.fetchFileWithRetry(url, badExts, settings_bot.max_retry_download, 0);
    }

    private async fetchFileWithRetry(
        url: string,
        badExts: string[],
        maxRetries: number,
        currentAttempt: number
    ): Promise<ScanResult> {
        return new Promise((resolve) => {
            const attempt = () => {
                const request = https.get(url, { headers: { Range: "bytes=0-4100" } }, (res) => {
                    if (res.statusCode === 404) {
                        return this.handleNotFound(maxRetries, currentAttempt, attempt, resolve);
                    }
                    if (![200, 206].includes(res.statusCode || 0)) {
                        eLog(`[Scanner] ⚠️ HTTP Error ${res.statusCode}`);
                        return resolve({ status: false, message: `HTTP Error ${res.statusCode}` });
                    }
                    this.handleSuccessResponse(res, resolve, badExts);
                });
                request.on("error", () => {
                    resolve({ status: false, message: "Error scanning file" });
                });
            };
            attempt();
        });
    }

    private handleNotFound(
        maxRetries: number,
        currentAttempt: number,
        attempt: () => void,
        resolve: (value: ScanResult) => void
    ): void {
        if (currentAttempt < maxRetries) {
            const nextAttempt = currentAttempt + 1;
            const delay = nextAttempt * 600;
            eLog(`[Scanner] ⏳ Waiting cloud file... retry ${nextAttempt}/${maxRetries} in ${delay}ms`);
            setTimeout(attempt, delay);
            return;
        }
        eLog(`[Scanner] ❌ File missing on Telegram cloud after ${maxRetries} retries`);
        resolve({ status: false, message: "File missing on Telegram cloud" });
    }

    private async handleSuccessResponse(
        res: IncomingMessage,
        resolve: (value: ScanResult) => void,
        badExts: string[]
    ): Promise<void> {
        const chunks: Buffer[] = [];

        res.on("data", (chunk: Buffer) => {
            chunks.push(chunk);
            if (Buffer.concat(chunks).length >= LIMIT_TELEGRAM_FILE_SIZE) {
                res.destroy();
            }
        });

        res.on("end", async () => {
            const buffer = Buffer.concat(chunks);
            const scanResult = await this.protect_buffer(buffer, badExts, true);
            if (scanResult.status) {
                eLog(`[Scanner] 🛑 Blocked file: ${scanResult.message}`);
                return resolve({ status: true, message: "Blocked file" });
            }
            resolve({ status: false, message: "File safe" });
        });

        res.on("error", () => resolve({ status: false, message: "Error scanning file" }));
    }
}

export default new ExecutorImgController();
