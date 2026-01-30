import { Request, Response } from "express";
import mongoose, { set } from "mongoose";
import AppUser from "../models/model_user";
import Platform from "../models/model_platform";
import Setting from "../models/model_settings";

import hashData from "../helper/hash_data";
import CheckJWT from "../helper/check_jwt";
import { PlatformDoc, SettingDoc } from "../types/type";
import { PHONE_REGEX, EMAIL_REGEX } from "../constants";
import { get_env } from "../utils/get_env";
import { empty, random_number, expiresAt, eLog, generate_string } from "../utils/util";
import { get_session_id } from "../helper/random";
import { ProtectController } from "./controller_protect";
import { response_data } from "../libs/lib";
import { SaveTelegramBotDTO } from "../interface";
import axios from "axios";
import { cache } from "sharp";

class TelegramController extends ProtectController {
    private validateTelegramToken(token: string): boolean {
        const regex = /^[0-9]{7,12}:[A-Za-z0-9_-]{35}$/;
        return regex.test(token.trim());
    }

    public async get_settings_bot(req: Request, res: Response) {
        try {
            const result = await this.protect_get<{ user_id: string, session_id: string }>(req, res);
            if (!result) return;

            const { user_id } = result;

            if (!user_id) return response_data(res, 400, "Invalid request", []);

            const user = await AppUser.findOne({ user_id }).lean();
            if (!user)
                return response_data(res, 400, "Invalid user", []);

            const settings = await Setting.findOne({ user_id }).lean() as SettingDoc;
            const platform = await Platform.findOne({ user_id }).lean() as PlatformDoc;
            const platFormList = platform?.telegram?.bot ?? [];

            const webHook = platform?.telegram?.web_hook ?? "";
            const botList = settings?.telegram?.bot ?? [];
            const activeBot = botList.find(b => b.process === true) || botList[0] || null;
            const botUsername = platFormList.find(b => b.bot_token_enc === activeBot?.bot_token)?.bot_username ?? "";

            const collection = {
                botUsername,
                botToken: hashData.decryptData(activeBot?.bot_token ?? "") ?? "",
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
            const settings = (await Setting.findOne({ user_id }).session(session)) || new Setting({ user_id });

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
            const botUsername = botList.find(b => b.bot_token_enc === bot_token_enc)?.bot_username ?? "";
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

            await platform.save({ session });
            await settings.save({ session });
            await session.commitTransaction();

            const collection = {
                botUsername,
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

    public async get_file_link(user_id: string, file_id: string) {
        try {
            if (!user_id || !file_id) return null;
            const url_path = get_env("SERVER_BOT_URL", "http://127.0.0.1");
            const res = await axios.get(`${url_path}/api/get-file-link`, {
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

export default new TelegramController;
