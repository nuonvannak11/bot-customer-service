import { Context } from "grammy";
import * as https from "https";
import PQueue from "p-queue";
import { eLog } from "../utils/util";
import { API_TELEGRAM, LIMIT_TELEGRAM_FILE_SIZE } from "../constants";
import { ProtectController } from "../controller/controller_protect";

class BotProcessorImg extends ProtectController {
    private queues = new Map<string, PQueue>();
    private process = new Map<string, boolean>();

    public addTask(ctx: Context, doc: any, user_id: string) {
        if (!user_id) return;
        if (!this.queues.has(user_id)) {
            this.queues.set(user_id, new PQueue({
                concurrency: 1,
                interval: 1000,
                intervalCap: 2
            }));
            eLog(`[Queue] Created group queue for ${user_id}`);
        }

        const queue = this.queues.get(user_id)!;
        const uniqueId = doc.file_unique_id;
        if (this.process.has(uniqueId)) {
            eLog(`[Worker] File ${uniqueId} already processing`);
            return;
        }
        this.process.set(uniqueId, true);
        queue.add(() =>
            this.worker(ctx, doc)
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
    }

    private async worker(ctx: Context, doc: any) {
        try {
            const fileName = doc.file_name || "unknown";
            if (doc.file_size && doc.file_size > LIMIT_TELEGRAM_FILE_SIZE) {
                eLog(`[Worker] File too large — skipping: ${fileName}`);
                return;
            }
            const fileInfo = await ctx.api.getFile(doc.file_id);
            if (!fileInfo.file_path) return;
            const telegramPath = fileInfo.file_path;
            const fileUrl = `${API_TELEGRAM}/file/bot${ctx.api.token}/${telegramPath}`;

            eLog(`[Worker] Scanning Cloud: ${fileUrl}`);

            const check_file_unsafe = await this.scanFileHeader(fileUrl);
            if (check_file_unsafe.status) {
                eLog(`[Worker] 🚨 DANGEROUS FILE: ${fileName}`);
                await ctx.deleteMessage().catch(() => { });
                await ctx.reply(
                    `🚨 <b>Security Alert:</b> File <code>${fileName}</code> was blocked.`,
                    { parse_mode: "HTML" }
                ).catch(() => { });
            } else {
                eLog(`[Worker] ✅ File clean: ${fileName}`);
            }
        } catch (error) {
            eLog("[Worker] Error:", error);
        }
    }

    private async scanFileHeader(url: string, retries = 6): Promise<{ status: boolean; message: string }> {
        return new Promise((resolve) => {
            const options = { headers: { Range: "bytes=0-4100" } };
            const attempt = () => {
                https.get(url, options, (res) => {
                    if (res.statusCode === 404) {
                        if (retries > 0) {
                            retries--;
                            const delay = (7 - retries) * 600;
                            eLog(`[Scanner] ⏳ Waiting cloud file... retry in ${delay}ms`);
                            setTimeout(attempt, delay);
                            return;
                        }
                        eLog(`[Scanner] ❌ File missing on Telegram cloud`);
                        return resolve({ status: false, message: "File missing on Telegram cloud" });
                    }

                    if (![200, 206].includes(res.statusCode || 0)) {
                        eLog(`[Scanner] ⚠️ HTTP Error ${res.statusCode}`);
                        return resolve({ status: false, message: `HTTP Error ${res.statusCode}` });
                    }
                    const chunks: Buffer[] = [];
                    res.on("data", (chunk) => {
                        chunks.push(chunk);
                        if (Buffer.concat(chunks).length >= LIMIT_TELEGRAM_FILE_SIZE) res.destroy();
                    });

                    res.on("end", async () => {
                        const buffer = Buffer.concat(chunks);
                        const blocked = ["exe", "msi", "apk", "cab", "deb", "rpm", "bat", "cmd", "sh"];
                        const check_file = await this.protect_buffer(buffer, blocked, true);
                        if (check_file.status) {
                            eLog(`[Scanner] 🛑 Blocked file: ${check_file.message}`);
                            return resolve({ status: true, message: "Blocked file" });
                        }
                        return resolve({ status: false, message: "File safe" });
                    });
                    res.on("error", () => resolve({ status: false, message: "Error scanning file" }));
                }).on("error", () => resolve({ status: false, message: "Error scanning file" }));
            };
            attempt();
        });
    }
}

export default new BotProcessorImg();
