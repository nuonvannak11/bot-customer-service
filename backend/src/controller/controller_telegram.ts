import axios from "axios";
import mongoose from "mongoose";
import { Request, Response } from "express";
import { eLog } from "../utils/util";
import AppUser from "../models/model_user";
import Platform from "../models/model_platform";
import model_bot from "../models/model_bot";
import model_setting from "../models/model_settings";
import hash_data from "../helper/hash_data";
import HashKey from "../helper/hash_key";
import { ProtectController } from "./controller_protect";
import { response_data } from "../libs/lib";
import { SaveTgBotRequest } from "../interface";
import { get_url } from "../libs/get_urls";
import { httpAgent } from "../libs/lib";
import { IManagedAsset } from "../models/model_managed_asset";

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

const req_bot = axios.create({
    httpAgent,
    timeout: 20000,
    validateStatus: (status) => status < 500
});

class TelegramController extends ProtectController {
    private validateTelegramToken(token: string): boolean {
        const regex = /^[0-9]{7,12}:[A-Za-z0-9_-]{35}$/;
        return regex.test(token.trim());
    }

    private async handleOpenBot(res: Response, bot_token: string, bot_token_enc: string, user_id: string): Promise<Response | void> {
        const session = await mongoose.startSession();
        try {
            let db_lock_success = false;
            await session.withTransaction(async () => {
                const update_model_bot = await model_bot.updateOne(
                    {
                        user_id,
                        bot_token: bot_token_enc,
                        is_process: false,
                        is_opening: { $ne: true }
                    },
                    {
                        $set: {
                            is_opening: true,
                            updated_at: new Date()
                        }
                    },
                    { session }
                );
                if (update_model_bot.matchedCount === 0) {
                    throw new Error("Bot is already running, locked, or processing.");
                }
                db_lock_success = true;
            });
            if (!db_lock_success) return;

            let api_success = false;
            let api_data = null;
            try {
                const response = await req_bot.post(
                    get_url("open_bot"),
                    { bot_token, user_id }
                );
                const { code, message, data } = response.data;
                if (code === 200) {
                    api_success = true;
                    api_data = data;
                } else {
                    throw new Error(message || "External API refused connection");
                }
            } catch (api_err) {
                eLog("❌ API Start Failed, reverting DB...", api_err);
            }

            await session.withTransaction(async () => {
                if (api_success) {
                    await model_bot.updateOne(
                        { user_id, bot_token: bot_token_enc },
                        {
                            $set: {
                                is_process: true,
                                is_opening: false,
                                bot_id: api_data.id,
                                is_bot: api_data.is_bot ?? true,
                                first_name: api_data.first_name || '',
                                username: `@${api_data.username}`,
                                can_join_groups: api_data.can_join_groups ?? false,
                                can_read_all_group_messages: api_data.can_read_all_group_messages ?? false,
                                supports_inline_queries: api_data.supports_inline_queries ?? false,
                                updated_at: new Date()
                            }
                        },
                        { session }
                    );
                    await model_setting.updateOne(
                        { user_id, "telegram.bot.bot_token": bot_token_enc },
                        {
                            $set: {
                                "telegram.bot.$.process": true,
                                "telegram.bot.$.updated_at": new Date()
                            }
                        },
                        { session }
                    );
                    await Platform.updateOne(
                        { user_id, "telegram.bot.bot_token_enc": bot_token_enc },
                        {
                            $set: {
                                "telegram.bot.$.bot_username": `@${api_data.username}`,
                                "telegram.bot.$.updated_at": new Date()
                            }
                        },
                        { session }
                    );

                } else {
                    await model_bot.updateOne(
                        { user_id, bot_token: bot_token_enc },
                        { $set: { is_opening: false } },
                        { session }
                    );
                }
            });
            if (api_success) {
                const format_data = hash_data.encryptData(JSON.stringify(api_data));
                return response_data(res, 200, "Bot started successfully", format_data);
            } else {
                return response_data(res, 500, "Failed to start bot (External API Error)", null);
            }
        } catch (err: any) {
            eLog("❌ Critical System Error:", err);
            return response_data(res, 500, err.message || "System error starting bot", null);
        } finally {
            await session.endSession();
        }
    }

    private async handleCloseBot(res: Response, bot_token: string, bot_token_enc: string, user_id: string): Promise<Response | void> {
        const session = await mongoose.startSession();
        try {
            let db_lock_success = false;
            await session.withTransaction(async () => {
                const update_bot = await model_bot.updateOne(
                    { user_id, bot_token: bot_token_enc, is_process: true, is_closing: { $ne: true } },
                    {
                        $set: {
                            is_closing: true,
                            updated_at: new Date()
                        }
                    },
                    { session }
                );
                if (update_bot.matchedCount === 0) {
                    throw new Error("Bot is already closed, locked, or busy.");
                }
                const update_setting = await model_setting.updateOne(
                    {
                        user_id,
                        "telegram.bot.bot_token": bot_token_enc,
                        "telegram.bot.process": true
                    },
                    {
                        $set: {
                            "telegram.bot.$.is_closing": true,
                            "telegram.bot.$.updated_at": new Date()
                        }
                    },
                    { session }
                );
                if (update_setting.matchedCount === 0) {
                    throw new Error("Bot setting record not found.");
                }
                db_lock_success = true;
            });
            if (!db_lock_success) return;

            let api_success = false;
            let api_data = null;

            try {
                const response = await req_bot.post(get_url("close_bot"), { bot_token, user_id });
                const { code, message, data } = response.data;
                if (code === 200) {
                    api_success = true;
                    api_data = data;
                } else {
                    throw new Error(message || "External API returned error");
                }
            } catch (api_err) {
                eLog("❌ External API failed, reverting DB...", api_err);
            }

            await session.withTransaction(async () => {
                if (api_success) {
                    await model_bot.updateOne(
                        { user_id, bot_token: bot_token_enc },
                        { $set: { is_process: false, is_closing: false, updated_at: new Date() } },
                        { session }
                    );
                    await model_setting.updateOne(
                        { user_id, "telegram.bot.bot_token": bot_token_enc },
                        { $set: { "telegram.bot.$.process": false, "telegram.bot.$.is_closing": false } },
                        { session }
                    );
                } else {
                    await model_bot.updateOne(
                        { user_id, bot_token: bot_token_enc },
                        { $set: { is_closing: false } },
                        { session }
                    );
                    await model_setting.updateOne(
                        { user_id, "telegram.bot.bot_token": bot_token_enc },
                        { $set: { "telegram.bot.$.is_closing": false } },
                        { session }
                    );
                }
            });
            if (api_success) {
                const format_data = hash_data.encryptData(JSON.stringify(api_data));
                return response_data(res, 200, "Bot closed successfully", format_data);
            } else {
                return response_data(res, 500, "Failed to close bot (External API Error)", null);
            }
        } catch (err: any) {
            eLog("❌ Critical Error in handleCloseBot:", err);
            return response_data(res, 400, err.message || "Failed to initiate close", null);
        } finally {
            await session.endSession();
        }
    }

    public async get_file_link(user_id: string, file_id: string) {
        try {
            if (!user_id || !file_id) return null;
            const res = await req_bot.get(get_url("get_bot_file_link"), { params: { user_id, file_id } });
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
                botToken: hash_data.decryptData(activeBot?.bot_token ?? "") ?? "",
                is_process: activeBot?.process ?? false,
                webhookUrl: webHook,
                webhookEnabled: activeBot?.enable_web_hook ?? false,
                notifyEnabled: activeBot?.push_notifications ?? false,
                silentMode: activeBot?.silent_mode ?? false,
                exceptionLinks: settings?.user?.exceptionLinks ?? [],
            };
            const encrypted = hash_data.encryptData(JSON.stringify(collection));
            return response_data(res, 200, "Success", encrypted);
        } catch (err) {
            eLog(err);
            return response_data(res, 500, "Internal server error", []);
        }
    }

    public async save_bot(req: Request, res: Response) {
        const result = await this.protect_post<SaveTgBotRequest>(req, res, true);
        if (!result) return;

        const { exceptionLinks, user_id, botToken, webhookUrl, webhookEnabled, notifyEnabled, silentMode } = result;

        if (!user_id || !botToken) return response_data(res, 400, "Invalid request", []);
        if (!this.validateTelegramToken(botToken)) return response_data(res, 400, "Invalid bot token", []);
        const bot_token_enc = hash_data.encryptData(botToken);
        const existingBot = await model_bot.findOne({
            bot_token: bot_token_enc,
            user_id: { $ne: user_id }
        });

        if (existingBot) {
            return response_data(res, 400, "Bot token already in use by another account", []);
        }
        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            const platform = (await Platform.findOne({ user_id }).select("+telegram.bot.bot_token_enc").session(session)) || new Platform({ user_id });
            const settings = (await model_setting.findOne({ user_id }).session(session)) || new model_setting({ user_id });

            let bot = await model_bot.findOne({ user_id, bot_token: bot_token_enc }).session(session);
            if (!bot) {
                bot = new model_bot({ user_id, bot_token: bot_token_enc });
            }
            platform.telegram ||= { web_hook: "", bot: [], user: [] };
            settings.telegram ||= { bot: [], user: [] };

            const botList = platform.telegram.bot;
            const botSettingList = settings.telegram.bot;

            const botIndex = botList.findIndex(b => b.bot_token_enc === bot_token_enc);
            const settingIndex = botSettingList.findIndex(b => b.bot_token === bot_token_enc);

            if (botIndex === -1 && botList.length >= 3) {
                await session.abortTransaction();
                return response_data(res, 400, "Max 3 Telegram bots allowed", []);
            }
            platform.telegram.web_hook = webhookUrl ?? "";
            settings.user.exceptionLinks = exceptionLinks ?? [];

            if (botIndex === -1) {
                botList.push({ bot_token_enc });
            }

            const newSettingObj = {
                bot_token: bot_token_enc,
                enable_web_hook: Boolean(webhookEnabled),
                push_notifications: Boolean(notifyEnabled),
                silent_mode: Boolean(silentMode),
            };

            if (settingIndex === -1) {
                botSettingList.push(newSettingObj);
            } else {
                Object.assign(botSettingList[settingIndex], newSettingObj);
            }

            bot.user_id = user_id;
            bot.bot_token = bot_token_enc;

            await bot.save({ session });
            await platform.save({ session });
            await settings.save({ session });

            await session.commitTransaction();

            const collection = {
                botUsername: "",
                botToken: botToken,
                webhookUrl: webhookUrl,
                webhookEnabled: Boolean(webhookEnabled),
                notifyEnabled: Boolean(notifyEnabled),
                silentMode: Boolean(silentMode),
                exceptionLinks,
            };

            const encryptedCollections = hash_data.encryptData(JSON.stringify(collection));
            return response_data(res, 200, "Telegram bot updated", encryptedCollections);

        } catch (err) {
            eLog("Error saving bot:", err);
            if (session.inTransaction()) {
                await session.abortTransaction();
            }
            return response_data(res, 500, "Failed to update bot", []);
        } finally {
            await session.endSession();
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
            const bot_token_enc = hash_data.encryptData(bot_token);
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

    public async protects(req: Request, res: Response) {
        try {
            const result = await this.protect_post<IManagedAsset>(req, res, true);
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
