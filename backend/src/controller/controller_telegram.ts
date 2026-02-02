import e, { Request, Response } from "express";
import mongoose from "mongoose";
import axios from "axios";
import { eLog } from "../utils/util";
import AppUser from "../models/model_user";
import Platform from "../models/model_platform";
import model_bot from "../models/model_bot";
import model_setting from "../models/model_settings";
import hashData from "../helper/hash_data";
import HashKey from "../helper/hash_key";
import { ProtectController } from "./controller_protect";
import { response_data } from "../libs/lib";
import { SaveTelegramBotDTO } from "../interface";
import { get_url } from "../libs/get_urls";

interface OpenCloseBotRequest {
    token: string;
    bot_token: string;
    user_id: string;
    hash_key: string;
    method: string;
}

interface GetBotSettingRequest {
    token: string;
    user_id: string;
    session_id: string;
}

class TelegramController extends ProtectController {
    private validateTelegramToken(token: string): boolean {
        const regex = /^[0-9]{7,12}:[A-Za-z0-9_-]{35}$/;
        return regex.test(token.trim());
    }

    public async get_settings_bot(req: Request, res: Response): Promise<Response | void> {
        try {
            const result = await this.protect_get<GetBotSettingRequest>(req, res);
            if (!result) return;
            const { user_id, token } = result;
            if (!user_id || !token) return response_data(res, 400, "Invalid request", []);

            const check_user = await AppUser.findOne({ user_id, access_token_hash: token }).lean();
            if (!check_user) {
                return response_data(res, 401, "Unauthorized user", []);
            }
            const settings = await model_setting.findOne({ user_id }).lean();
            const platform = await Platform.findOne({ user_id }).select("+telegram.bot.bot_token_enc").lean();
            const platFormList = platform?.telegram?.bot ?? [];

            const webHook = platform?.telegram?.web_hook ?? "";
            const botList = settings?.telegram?.bot ?? [];
            const activeBot = botList.find(b => b.process === true) || botList[0] || null;
            const botUsername = platFormList.find(b => b.bot_token_enc === activeBot?.bot_token)?.bot_username ?? "";
            const collection = {
                botUsername,
                botToken: hashData.decryptData(activeBot?.bot_token ?? "") ?? "",
                is_process: activeBot?.process ?? false,
                webhookUrl: webHook,
                webhookEnabled: activeBot?.enable_web_hook ?? false,
                notifyEnabled: activeBot?.push_notifications ?? false,
                silentMode: activeBot?.silent_mode ?? false,
                exceptionLinks: settings?.user?.exceptionLinks ?? [],
            };
            const encrypted = hashData.encryptData(JSON.stringify(collection));
            return response_data(res, 200, "Success", encrypted);
        } catch (err) {
            eLog(err);
            return response_data(res, 500, "Internal server error", []);
        }
    }

    public async save_bot(req: Request, res: Response) {
        const result = await this.protect_post<SaveTelegramBotDTO>(req, res, true);
        if (!result) return;

        const { exceptionLinks, user_id, botToken, webhookUrl, webhookEnabled, notifyEnabled, silentMode } = result;

        if (!user_id || !botToken) {
            return response_data(res, 400, "Invalid request", []);
        }
        if (!this.validateTelegramToken(botToken)) {
            return response_data(res, 400, "Invalid bot token", []);
        }
        const bot_token_enc = hashData.encryptData(botToken);
        const check_user = await AppUser.findOne({ user_id });
        if (!check_user) return response_data(res, 400, "Invalid user", []);

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const platform = (await Platform.findOne({ user_id }).select("+telegram.bot.bot_token_enc").session(session)) || new Platform({ user_id });
            const settings = (await model_setting.findOne({ user_id }).session(session)) || new model_setting({ user_id });
            const bot = (await model_bot.findOne({ user_id, bot_token: bot_token_enc }).session(session)) || new model_bot({ user_id, bot_token: bot_token_enc });

            platform.telegram ||= { web_hook: "", bot: [], user: [] };
            settings.telegram ||= { bot: [], user: [] };

            const botList = platform.telegram.bot;
            const botSettingList = settings.telegram.bot;

            if (botList.length >= 3) {
                await session.abortTransaction();
                return response_data(res, 400, "Max 3 Telegram bots", []);
            }
            const botIndex = botList.findIndex(b => b.bot_token_enc === bot_token_enc);
            const settingIndex = botSettingList.findIndex(b => b.bot_token === bot_token_enc);

            platform.telegram.web_hook = webhookUrl ?? "";
            settings.user.exceptionLinks = exceptionLinks ?? [];

            if (botIndex === -1) {
                botList.push({ bot_token_enc });
            }
            if (settingIndex === -1) {
                botSettingList.push({
                    bot_token: bot_token_enc,
                    enable_web_hook: Boolean(webhookEnabled),
                    push_notifications: Boolean(notifyEnabled),
                    silent_mode: Boolean(silentMode),
                });
            } else {
                const botSetting = botSettingList[settingIndex];
                botSetting.bot_token = bot_token_enc;
                botSetting.enable_web_hook = Boolean(webhookEnabled);
                botSetting.push_notifications = Boolean(notifyEnabled);
                botSetting.silent_mode = Boolean(silentMode);
            }
            bot.user_id = user_id;
            bot.bot_token = bot_token_enc;

            await bot.save({ session });
            await platform.save({ session });
            await settings.save({ session });
            await session.commitTransaction();

            const collection = {
                botUsername: "",
                botToken: hashData.decryptData(bot_token_enc),
                webhookUrl: webhookUrl,
                webhookEnabled: Boolean(webhookEnabled),
                notifyEnabled: Boolean(notifyEnabled),
                silentMode: Boolean(silentMode),
                exceptionLinks,
            };
            const formatData = JSON.stringify(collection);
            const encryptedCollections = hashData.encryptData(formatData);
            return response_data(res, 200, "Telegram bot updated", encryptedCollections);
        } catch (err) {
            await session.abortTransaction();
            eLog(err);
            return response_data(res, 500, "Failed to update bot", []);
        }
    }

    public async open_close_bot(req: Request, res: Response): Promise<Response | void> {
        try {
            const result = await this.protect_post<OpenCloseBotRequest>(req, res, true);
            if (!result) return;
            const { bot_token, user_id, hash_key, token, method } = result;
            if (!bot_token || !user_id || !hash_key || !token || !method) {
                return response_data(res, 400, "Missing required fields", null);
            }
            if (!HashKey.decrypt(hash_key)) {
                return response_data(res, 400, "Invalid hash key", null);
            }
            if (!this.validateTelegramToken(bot_token)) {
                return response_data(res, 400, "Invalid bot token format", null);
            }
            if (!['open', 'close'].includes(method)) {
                return response_data(res, 400, "Invalid method. Use 'open' or 'close'", null);
            }
            const check_user = await AppUser.findOne({ user_id, access_token_hash: token });
            if (!check_user) {
                return response_data(res, 401, "Unauthorized user", null);
            }
            const bot_token_enc = hashData.encryptData(bot_token);
            const [settings, find_bot] = await Promise.all([
                model_setting.findOne({ user_id }),
                model_bot.findOne({ user_id, bot_token: bot_token_enc })
            ]);
            if (!settings) {
                return response_data(res, 404, "User settings not found", null);
            }

            const botSettingList = settings?.telegram?.bot || [];
            const botSetting = botSettingList.find(b => b.bot_token === bot_token_enc);

            if (!botSetting || !find_bot) {
                return response_data(res, 404, "Bot not found", null);
            }

            if (method === 'open') {
                if (botSetting.process) {
                    return response_data(res, 200, "Bot is already running", null);
                }
                return await this.handleOpenBot(res, bot_token, bot_token_enc, user_id);
            } else {
                if (botSetting.process === false) {
                    return response_data(res, 200, "Bot is already closed", null);
                }
                return await this.handleCloseBot(res, bot_token, bot_token_enc, user_id);
            }
        } catch (err: any) {
            eLog("❌ open_close_bot error:", err);
            return response_data(res, 500, "Internal server error", null);
        }
    }

    private async handleOpenBot(res: Response, bot_token: string, bot_token_enc: string, user_id: string): Promise<Response | void> {
        let session: any = null;
        try {
            const response = await axios.post(
                get_url("open_bot"),
                { bot_token, user_id },
                {
                    timeout: 10000,
                    validateStatus: (status) => status < 500
                }
            );
            const { code, message, data } = response.data;
            if (code !== 200) {
                return response_data(res, code, message, data);
            }
            session = await mongoose.startSession();
            session.startTransaction();

            const [update_model_bot, update_setting, update_platform] = await Promise.all([
                model_bot.updateOne(
                    { user_id, bot_token: bot_token_enc, is_process: false },
                    {
                        $set: {
                            bot_id: data.id,
                            is_process: true,
                            is_bot: data.is_bot ?? true,
                            first_name: data.first_name || '',
                            username: `@${data.username}`,
                            can_join_groups: data.can_join_groups ?? false,
                            can_read_all_group_messages: data.can_read_all_group_messages ?? false,
                            supports_inline_queries: data.supports_inline_queries ?? false,
                            updated_at: new Date()
                        }
                    },
                    { session }
                ),
                model_setting.updateOne(
                    {
                        user_id,
                        "telegram.bot.bot_token": bot_token_enc,
                        "telegram.bot.process": false
                    },
                    {
                        $set: {
                            "telegram.bot.$.process": true,
                            "telegram.bot.$.updated_at": new Date()
                        }
                    },
                    { session }
                ),
                Platform.updateOne(
                    {
                        user_id,
                        "telegram.bot.bot_token_enc": bot_token_enc,
                    },
                    {
                        $set: {
                            "telegram.bot.$.bot_username": `@${data.username}`,
                            "telegram.bot.$.updated_at": new Date()
                        }
                    },
                    { session }
                )
            ]);
            if (update_model_bot.matchedCount === 0) {
                throw new Error("Bot already running or locked");
            }
            if (update_setting.matchedCount === 0) {
                throw new Error("Bot record not found in settings");
            }
            if (update_platform.matchedCount === 0) {
                throw new Error("Bot record not found in platform");
            }
            await session.commitTransaction();
            const format_data = hashData.encryptData(JSON.stringify(data));
            return response_data(res, 200, "Bot started successfully", format_data);

        } catch (err: any) {
            eLog("❌ Error opening bot:", err);
            try {
                await axios.post(
                    get_url("close_bot"),
                    { bot_token, user_id },
                    { timeout: 10000 }
                ).catch(() => {
                    eLog("⚠️ Failed to rollback bot opening");
                });
            } catch (rollbackErr) {
                eLog("❌ Rollback failed:", rollbackErr);
            }
            if (session) {
                await session.abortTransaction();
            }
            return response_data(res, 500, err.message || "Failed to start bot", null);
        } finally {
            if (session) {
                session.endSession();
            }
        }
    }

    private async handleCloseBot(res: Response, bot_token: string, bot_token_enc: string, user_id: string): Promise<Response | void> {
        let session: any = null;
        try {
            const response = await axios.post(
                get_url("close_bot"),
                { bot_token, user_id },
                {
                    timeout: 10000,
                    validateStatus: (status) => status < 500
                }
            );
            const { code, message, data } = response.data;
            if (code !== 200) {
                return response_data(res, code, message, data);
            }
            session = await mongoose.startSession();
            session.startTransaction();

            const [update_model_bot, update_setting] = await Promise.all([
                model_bot.updateOne(
                    { user_id, bot_token: bot_token_enc, is_process: true },
                    {
                        $set: {
                            is_process: false,
                            updated_at: new Date()
                        }
                    },
                    { session }
                ),
                model_setting.updateOne(
                    {
                        user_id,
                        "telegram.bot.bot_token": bot_token_enc,
                        "telegram.bot.process": true
                    },
                    {
                        $set: {
                            "telegram.bot.$.process": false,
                            "telegram.bot.$.updated_at": new Date()
                        }
                    },
                    { session }
                )
            ]);

            if (update_model_bot.matchedCount === 0) {
                throw new Error("Bot already closed or locked");
            }
            if (update_setting.matchedCount === 0) {
                throw new Error("Bot record not found in settings");
            }
            await session.commitTransaction();
            const format_data = hashData.encryptData(JSON.stringify(data));
            return response_data(res, 200, "Bot closed successfully", format_data);
        } catch (err: any) {
            eLog("❌ Error closing bot:", err);
            try {
                await axios.post(
                    get_url("open_bot"),
                    { bot_token, user_id },
                    { timeout: 10000 }
                ).catch(() => {
                    eLog("⚠️ Failed to rollback bot closing");
                });
            } catch (rollbackErr) {
                eLog("❌ Rollback failed:", rollbackErr);
            }

            if (session) {
                await session.abortTransaction();
            }
            return response_data(res, 500, err.message || "Failed to close bot", null);
        } finally {
            if (session) {
                session.endSession();
            }
        }
    }

    public async get_file_link(user_id: string, file_id: string) {
        try {
            if (!user_id || !file_id) return null;
            const res = await axios.get(get_url("get_bot_file_link"), {
                params: { user_id, file_id },
                timeout: 5000
            });
            const { code, message, data } = res.data;
            if (code !== 200) {
                eLog("❌ get_file_link error:", message);
                return null;
            }
            return data;
        } catch (err: any) {
            eLog("❌ get_file_link error:", err?.message || err);
            return null;
        }
    }

    public async get_group_telegram(req: Request, res: Response) {

    }

    public async protects(req: Request, res: Response) {
        try {
            const result = await this.protect_get<{ user_id: string, session_id: string }>(req, res);
            if (!result) return;

            const { user_id } = result;

            if (!user_id) return response_data(res, 400, "Invalid request", []);
        } catch (err) {
            eLog("❌ protects error:", err);
            return response_data(res, 500, "Internal server error", []);
        }
    }
}

export default new TelegramController();
