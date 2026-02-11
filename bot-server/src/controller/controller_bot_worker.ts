import { Request, Response } from "express";
import { Bot } from "grammy";
import { eLog, getErrorMessage } from "../utils/util";
import { API_TELEGRAM } from "../constants";
import { response_data } from "../libs/lib";
import { BotEntry, BotInfo } from "../types/type";
import { get_env } from "../utils/get_env";
import axios, { AxiosError } from "axios";
import controller_telegram_bot from "./controller_telegram_bot";
import { Message } from "@grammyjs/types";

interface OpenBotStart {
    status: boolean;
    message: string;
    data: BotInfo | null;
}

class BotTelegram {
    private bots = new Map<string, BotEntry>();
    private botsByToken = new Map<string, BotEntry>();

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

    private handleErrorMsg(err: unknown): string {
        if (axios.isAxiosError(err)) {
            const ax = err as AxiosError;
            if (ax.code === "ECONNABORTED") {
                return "Request timed out";
            }
            if (ax.response) {
                return ax.response.statusText || "External API Error";
            }
        }
        const message = getErrorMessage(err) || "Internal Server Error";
        return message;
    }

    private async registerWebhook(bot_token: string): Promise<{ status: boolean; message: string }> {
        try {
            const WEBHOOK_URL = get_env("WEBHOOK_URL");
            const webhookUrl = `${WEBHOOK_URL}/telegram/${bot_token}`;
            const apiUrl = `${API_TELEGRAM}/bot${bot_token}/setWebhook`;
            const response = await axios.post(apiUrl, {
                url: webhookUrl,
                allowed_updates: [
                    "message",
                    "channel_post",
                    "edited_channel_post",
                    "callback_query"
                ]
            });
            if (!response.data.ok) {
                throw new Error(response.data.description || "Failed to set webhook");
            }
            eLog("Webhook registered:", webhookUrl);
            return { status: true, message: "Webhook registered successfully" };

        } catch (error) {
            const message = this.handleErrorMsg(error);
            eLog(message);
            return { status: false, message };
        }
    }

    private async registerHandlers(bot: Bot, user_id: string, bot_token: string): Promise<boolean> {
        try {
            bot.command(["start", "help"], async (ctx) => {
                const command = ctx.update.message?.text?.split(" ")[0].replace("/", "");
                await controller_telegram_bot.command(ctx, user_id, command);
            });
            bot.on("message", async (ctx) => {
                const msg = ctx.message as Message;
                await controller_telegram_bot.message(ctx, user_id, bot_token, msg);
            });
            bot.on("channel_post", async (ctx) => {
                await controller_telegram_bot.channel_post(ctx, user_id, bot_token, ctx.channelPost);
            });
            bot.catch(err => eLog("Bot error", err));
            return true;
        } catch (error) {
            eLog("Bot error");
            return false;
        }
    }

    public async start_bot(user_id: string, bot_token: string): Promise<OpenBotStart> {
        try {
            const token = this.getToken(user_id);
            if (token && token === bot_token) {
                return { status: false, message: "Bot already running", data: null };
            }

            const bot = new Bot(bot_token);
            const registerHandlers = await this.registerHandlers(bot, user_id, bot_token);
            if (!registerHandlers) {
                return { status: false, message: "Error registering handlers", data: null };
            }
            const registerWebhook = await this.registerWebhook(bot_token);
            if (!registerWebhook.status) {
                return { status: false, message: registerWebhook.message, data: null };
            }
            const botInfo = await bot.api.getMe();
            const entry = { bot, token: bot_token, user_id };
            this.bots.set(user_id, entry);
            this.botsByToken.set(bot_token, entry);
            eLog(`Webhook bot started for user ${user_id}`);
            return { status: true, message: "Bot started (webhook)", data: botInfo };
        } catch (error) {
            return { status: false, message: "Error starting bot", data: null };
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
            const result = await this.start_bot(user_id, bot_token);
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

    public async webhook(req: Request, res: Response): Promise<Response> {
        try {
            const token = req.params.token;
            const entry = this.botsByToken.get(token);
            if (!entry) {
                eLog("Webhook for unknown bot:", token);
                return res.sendStatus(404);
            }
            await entry.bot.handleUpdate(req.body);
            return res.sendStatus(200);
        } catch (err) {
            eLog("Webhook error:", err);
            return res.sendStatus(500);
        }
    }

}

export default new BotTelegram();
