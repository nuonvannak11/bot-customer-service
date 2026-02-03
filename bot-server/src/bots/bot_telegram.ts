import { Request, Response } from "express";
import { Bot } from "grammy";
import type { Message } from "grammy/types";
import controller_bot from "../controller/controller_telegram_bot";
import { eLog } from "../utils/util";
import { API_TELEGRAM } from "../constants";
import { response_data } from "../libs/lib";
import { BotEntry, BotInfo } from "../types/type";

interface OpenBotStart {
    status: boolean;
    message: string;
    data: BotInfo | null;
}

class BotTelegram {
    private bots = new Map<string, BotEntry>();

    private getToken(user_id: string): string {
        const entry = this.bots.get(user_id);
        if (!entry) {
            return "";
        }
        return entry.token;
    }

    private getBot(user_id: string): Bot {
        const entry = this.bots.get(user_id);
        if (!entry) {
            throw new Error(`Bot not running for user ${user_id}`);
        }
        return entry.bot;
    }

    public async start(user_id: string, bot_token: string): Promise<OpenBotStart> {
        try {
            const token = this.getToken(user_id);
            if (token && token === bot_token) {
                return { status: false, message: "Bot already running for this user", data: null }
            }
            const bot = new Bot(bot_token);
            bot.command(["start", "help"], async (ctx) => {
                console.log("Received command:", ctx.update.message?.text);
                try {
                    const command = ctx.update.message?.text?.split(" ")[0].replace("/", "");
                    await controller_bot.command(ctx, user_id, command);
                } catch (err) {
                    eLog("Message handler error", err);
                }
            });

            await bot.api.getUpdates({ offset: -1 });
            bot.on("message", async (ctx) => {
                try {
                    const msg = ctx.message as Message;
                    await controller_bot.message(ctx, user_id, bot_token, msg);
                } catch (err) {
                    eLog("Message handler error", err);
                }
            });

            bot.catch((err) => {
                eLog(`Bot error [${user_id}]`, err.error);
            });

            try {
                const botInfo = await bot.api.getMe();
                await bot.init();
                bot.start({
                    allowed_updates: ["message", "callback_query"],
                    onStart: async (Info: BotInfo) => {
                        eLog(`Bot started for user ${user_id} as @${Info.username}`);
                    }
                });
                this.bots.set(user_id, { bot, token: bot_token });
                return { status: true, message: "Bot started successfully", data: botInfo }
            } catch (error) {
                return { status: false, message: "Error starting bot", data: null }
            }
        } catch (error) {
            return { status: false, message: "Error starting bot", data: null }
        }
    }

    public async stop(user_id: string) {
        const entry = this.bots.get(user_id);
        if (!entry) {
            return { status: false, message: "Bot not running for this user" }
        }
        await entry.bot.stop();
        this.bots.delete(user_id);
        return { status: true, message: "Bot stopped successfully" }
    }

    public async replace(user_id: string, bot_token: string) {
        try {
            if (this.bots.has(user_id)) {
                await this.stop(user_id);
            }
            await this.start(user_id, bot_token);
            return { status: true, message: "Bot replaced successfully" }
        } catch (error) {
            return { status: false, message: error }
        }

    }

    public isRunning(user_id: string) {
        if (!this.bots.has(user_id)) {
            return { status: false, message: "Bot not running for this user" };
        }
        return { status: true, message: "Bot is running" };
    }

    public async sendMessage(user_id: string, chat_id: number | string, text: string) {
        try {
            const bot = this.getBot(user_id);
            if (!bot) {
                return { status: false, message: "Bot not running for this user" }
            }
            const message = await bot.api.sendMessage(chat_id, text);
            if (!message) {
                return { status: false, message: "Message not sent" }
            }
            return { status: true, message: "Message sent successfully" }
        } catch (error) {
            return { status: false, message: error }
        }
    }

    public async deleteMessage(user_id: string, chat_id: number | string, message_id: number) {
        const bot = this.getBot(user_id);
        return bot.api.deleteMessage(chat_id, message_id);
    }

    public async editMessage(user_id: string, chat_id: number | string, message_id: number, text: string) {
        const bot = this.getBot(user_id);
        return bot.api.editMessageText(chat_id, message_id, text);
    }

    public async kickUser(user_id: string, chat_id: number | string, target_user_id: number, until_date?: number) {
        const bot = this.getBot(user_id);
        return bot.api.banChatMember(chat_id, target_user_id, {
            until_date,
        });
    }

    public async unbanUser(user_id: string, chat_id: number | string, target_user_id: number) {
        const bot = this.getBot(user_id);
        return bot.api.unbanChatMember(chat_id, target_user_id);
    }

    public async approveJoinRequest(user_id: string, chat_id: number | string, target_user_id: number) {
        const bot = this.getBot(user_id);
        return bot.api.approveChatJoinRequest(chat_id, target_user_id);
    }

    public async getUser(user_id: string, chat_id: number | string, target_user_id: number) {
        const bot = this.getBot(user_id);
        return bot.api.getChatMember(chat_id, target_user_id);
    }

    public async getChat(user_id: string, chat_id: number | string) {
        const bot = this.getBot(user_id);
        return bot.api.getChat(chat_id);
    }

    public async getAdmins(user_id: string, chat_id: number | string) {
        const bot = this.getBot(user_id);
        return bot.api.getChatAdministrators(chat_id);
    }

    public async getFileLink(req: Request, res: Response) {
        try {
            const user_id = req.query.user_id as string;
            const file_id = req.query.file_id as string;
            if (!user_id || !file_id) {
                return response_data(res, 400, "Missing user_id or file_id", "");
            }
            const entry = this.bots.get(user_id);
            if (!entry) {
                return response_data(res, 400, "Bot not running for this user", "");
            }
            const file = await entry.bot.api.getFile(file_id);
            if (!file.file_path) {
                return response_data(res, 400, "File not found", "");
            }
            const downloadUrl = `${API_TELEGRAM}/file/bot${entry.token}/${file.file_path}`;
            return response_data(res, 200, "Link generated successfully", downloadUrl);
        } catch (error) {
            return response_data(res, 500, "Error generating link", "");
        }
    }

    public async get_profile_photo(req: Request, res: Response) {
        try {
            const query = req.query || {};
            const user_id = query.user_id as string;
            const type = query.type as string;
            const targetId = query.target_id as string;

            if (!user_id || !type || !targetId) {
                return response_data(res, 400, "Missing required parameters", "");
            }
            const entry = this.getBot(user_id);
            if (!entry) {
                return response_data(res, 400, "Bot not running for this user", "");
            }
            let fileId: string | null = null;
            if (type === "bot" || type === "user") {
                const targetUserId = parseInt(targetId, 10);
                const photos = await entry.api.getUserProfilePhotos(targetUserId);
                if (photos.total_count === 0) {
                    return response_data(res, 400, "User not found", "");
                };
                fileId = photos.photos[0][0].file_id;
            }

            if (type === "group" || type === "channel") {
                const chat = await entry.api.getChat(targetId);
                if (!chat.photo) {
                    return response_data(res, 400, "Chat not found", "");
                }
                fileId = chat.photo.big_file_id;
            }

            if (!fileId) {
                return response_data(res, 400, "File not found", "");
            }
            const file = await entry.api.getFile(fileId);
            const url = `https://api.telegram.org/file/bot${entry.token}/${file.file_path}`;
            return response_data(res, 200, "Success", url);
        } catch (err) {
            return response_data(res, 500, "Error retrieving profile photo", "");
        }
    }

    public async req_start(req: Request, res: Response): Promise<Response> {
        try {
            const body = req.body || {};
            const user_id = body.user_id as string;
            const bot_token = body.bot_token as string;
            if (!user_id || !bot_token) {
                return response_data(res, 400, "Missing user_id or bot_token", null);
            }
            const result = await this.start(user_id, bot_token);
            console.log(user_id, bot_token, result);
            if (!result.status) {
                return response_data(res, 400, result.message, result.data);
            }
            return response_data(res, 200, result.message, result.data);
        } catch (err) {
            return response_data(res, 500, "Internal server error", null);
        }
    }

    public async req_stop(req: Request, res: Response): Promise<Response> {
        try {
            const body = req.body || {};
            const user_id = body.user_id as string;
            const bot_token = body.bot_token as string;
            if (!user_id || !bot_token) {
                return response_data(res, 400, "Missing user_id or bot_token", null);
            }
            const token = this.getToken(user_id);
            if (token && token !== bot_token) {
                return response_data(res, 400, "Invalid bot_token", null);
            }
            const result = await this.stop(user_id);
            if (!result.status) {
                return response_data(res, 400, result.message, null);
            }
            return response_data(res, 200, result.message, { user_id, bot_token });
        } catch (err) {
            return response_data(res, 500, "Internal server error", null);
        }
    }
}

export default new BotTelegram();
