import { Request, Response } from "express";
import { Bot } from "grammy";
import type { Message } from "grammy/types";
import controller_bot from "../controller/controller_telegram_bot";
import { eLog } from "../utils/util";
import { readLogFile, writeLogFile } from "../helper/log";
import { API_TELEGRAM } from "../constants";
import { response_data } from "../libs/lib";

type BotEntry = {
    bot: Bot;
    token: string;
};

class BotTelegram {
    private bots = new Map<string, BotEntry>();
    private tokenIndex = new Map<string, string>();
    private getBot(user_id: string): Bot {
        const entry = this.bots.get(user_id);
        if (!entry) {
            throw new Error(`Bot not running for user ${user_id}`);
        }
        return entry.bot;
    }

    public async start(user_id: string, bot_token: string) {
        try {
            if (this.bots.has(user_id)) {
                return { status: false, message: "Bot already running for this user" }
            }
            if (this.tokenIndex.has(bot_token)) {
                return { status: false, message: "Bot token already in use" };
            }
            const bot = new Bot(bot_token);
            bot.command(["start", "help"], async (ctx) => {
                try {
                    const command = ctx.update.message?.text?.split(" ")[0].replace("/", "");
                    await controller_bot.command(ctx, user_id, command);
                } catch (err) {
                    eLog("Message handler error", err);
                }
            });
            bot.on("message", async (ctx) => {
                try {
                    const msg = ctx.message as Message;
                    await controller_bot.message(ctx, user_id, msg);
                } catch (err) {
                    eLog("Message handler error", err);
                }
            });
            bot.catch((err) => {
                eLog(`Bot error [${user_id}]`, err.error);
            });

            try {
                await bot.init();
                bot.start({
                    allowed_updates: ["message", "callback_query"],
                    onStart: (botInfo) => {
                        const jsonData = readLogFile();
                        jsonData.logs.push({
                            time: new Date().toISOString(),
                            bot: botInfo
                        });
                        writeLogFile(jsonData);
                        eLog(`Bot @${botInfo.username} started successfully!`);
                    }
                });
                this.bots.set(user_id, { bot, token: bot_token });
                this.tokenIndex.set(bot_token, user_id);
                return { status: true, message: "Bot started successfully" }
            } catch (error) {
                return { status: false, message: error }
            }
        } catch (error) {
            return { status: false, message: error }
        }
    }

    public async stop(user_id: string) {
        const entry = this.bots.get(user_id);
        if (!entry) {
            return { status: false, message: "Bot not running for this user" }
        }
        await entry.bot.stop();
        this.bots.delete(user_id);
        this.tokenIndex.delete(entry.token);
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
            const body = req.body;
            const user_id = body.user_id;
            const file_id = body.file_id;
            if (!user_id || !file_id) {
                return response_data(res, 400, "Missing user_id or file_id", []);
            }
            const entry = this.bots.get(user_id);
            if (!entry) {
                return response_data(res, 400, "Bot not running for this user", []);
            }
            const file = await entry.bot.api.getFile(file_id);
            if (!file.file_path) {
                return response_data(res, 400, "File not found", []);
            }
            const downloadUrl = `${API_TELEGRAM}/file/bot${entry.token}/${file.file_path}`;
            return response_data(res, 200, "Link generated successfully", downloadUrl);
        } catch (error) {
            return response_data(res, 500, "Error generating link", []);
        }
    }
}

export default new BotTelegram();
