import { Context } from "grammy";
import * as http from "http";
import { fileTypeFromBuffer } from "file-type";
import { eLog } from "../utils/util";

const PROXY_ROOT = "http://142.93.27.35/tg-proxy";
const DELETE_ROOT = "http://142.93.27.35/tg-delete";

class BotProcessorImg {
    private process = new Map<string, boolean>();
    public addTask(ctx: Context, doc: any) {
        const uniqueId = doc.file_unique_id;
        if (this.process.has(uniqueId)) {
            eLog(`[Worker] File ${uniqueId} already processing`);
            return;
        }
        this.process.set(uniqueId, true);
        this.worker(ctx, doc).finally(() => {
            this.process.delete(uniqueId);
        });
    }

    private async worker(ctx: Context, doc: any) {
        eLog("[Worker] Started......", Date.now());
        try {
            const fileName = doc.file_name || "unknown";
            const fileInfo = await ctx.api.getFile(doc.file_id);
            if (!fileInfo.file_path) return;
            let telegramPath = fileInfo.file_path.replace(/^.*?(documents|photos|videos|voice|music|stickers|animations)\//, "$1/");
            const fileUrl = `${PROXY_ROOT}/${ctx.api.token}/${telegramPath}`;
            eLog(`[Worker] Scanning: ${fileUrl}:${Date.now()}`);
            const isSafe = await this.scanFileHeader(fileUrl);

            if (isSafe === false) {
                eLog(`[Worker] 🚨 DANGEROUS FILE: ${fileName}`);

                await ctx.deleteMessage().catch(() => { });
                await ctx.reply(
                    `🚨 <b>Security Alert:</b> File <code>${fileName}</code> was blocked.`,
                    { parse_mode: "HTML" }
                ).catch(() => { });
            } else {
                eLog(`[Worker] ✅ File clean: ${fileName}`);
            }
            await this.deleteTelegramFile(ctx, telegramPath);
        } catch (error) {
            eLog("[Worker] Error:", error);
        }
    }

    private async scanFileHeader(url: string, retries = 8): Promise<boolean> {
        return new Promise((resolve) => {
            const options = { headers: { Range: "bytes=0-4100" } };

            const attempt = () => {
                http.get(url, options, (res) => {
                    if (res.statusCode === 404) {
                        if (retries > 0) {
                            const delay = (9 - retries) * 700;
                            eLog(`[Scanner] ⏳ Waiting file... retry in ${delay}ms (${retries} left)`);
                            retries--;
                            setTimeout(attempt, delay);
                            return;
                        }
                        eLog(`[Scanner] ❌ File missing — FAIL CLOSED`);
                        resolve(false);
                        return;
                    }

                    if (![200, 206].includes(res.statusCode || 0)) {
                        eLog(`[Scanner] ⚠️ HTTP Error ${res.statusCode}`);
                        resolve(false);
                        return;
                    }
                    const chunks: Buffer[] = [];
                    res.on("data", (chunk) => {
                        chunks.push(chunk);
                        if (Buffer.concat(chunks).length >= 4100) res.destroy();
                    });

                    res.on("end", async () => {
                        const buffer = Buffer.concat(chunks);
                        if (!buffer.length) return resolve(false);

                        const detected = await fileTypeFromBuffer(buffer);
                        const headerHex = buffer.slice(0, 16).toString("hex");
                        const magic = buffer.toString("ascii", 0, 2);
                        if (magic === "MZ") {
                            eLog(`[Scanner] 🛑 Blocked EXE`);
                            return resolve(false);
                        }
                        if (headerHex.startsWith("504b0304")) {
                            eLog(`[Scanner] 🛑 Blocked ZIP payload`);
                            return resolve(false);
                        }
                        if (headerHex.startsWith("25504446")) {
                            eLog(`[Scanner] 🛑 Blocked PDF exploit`);
                            return resolve(false);
                        }
                        const blocked = ["exe", "msi", "apk", "cab", "deb", "rpm", "bat", "cmd", "sh"];
                        if (detected && blocked.includes(detected.ext)) {
                            eLog(`[Scanner] 🛑 Blocked type: ${detected.ext}`);
                            return resolve(false);
                        }
                        resolve(true);
                    });
                    res.on("error", () => resolve(false));
                }).on("error", () => resolve(false));
            };
            attempt();
        });
    }

    private async deleteTelegramFile(ctx: Context, telegramPath: string) {
        return new Promise<void>((resolve) => {
            const deleteUrl = `${DELETE_ROOT}/${ctx.api.token}/${telegramPath}`;
            const req = http.request(deleteUrl, { method: "DELETE" }, () => {
                eLog(`[Cleaner] Deleted: ${deleteUrl}`);
                resolve();
            });
            req.on("error", () => {
                eLog(`[Cleaner] Failed delete: ${deleteUrl}`);
                resolve();
            });
            req.end();
        });
    }
}

export default new BotProcessorImg();
