import { Bot } from "grammy";
// import controller_telegram from "../controller/controller_telegram";
import { eLog } from "../utils/util";
import https from 'https';
import { ca } from "zod/v4/locales";

type BotEntry = {
    bot: Bot;
    token: string;
};

class BotTelegram {
    private bots = new Map<string, BotEntry>();

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
            const bot = new Bot(bot_token);
            bot.command("start", (ctx) => ctx.reply("Bot started ✅"));
            bot.on("message:text", (ctx) =>
                ctx.reply(`Echo: ${ctx.message.text}`)
            );

            bot.catch((err) => {
                eLog(`Bot error [${user_id}]`, err.error);
            });

            try {
                await bot.init();
                bot.start({
                    allowed_updates: ["message", "callback_query"],
                    onStart: (botInfo) => {
                        eLog(`Bot @${botInfo.username} started successfully!`);
                    }
                });
                this.bots.set(user_id, { bot, token: bot_token });
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
}

export default new BotTelegram();
