import { NextRequest } from "next/server";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import { get_env, response_data } from "@/libs/lib";
import HashData from "@/helper/hash_data";
import { make_schema } from "@/helper/helper";
import { defaultTelegramConfig } from "@/default/default";
import { ProtectController } from "./controller_protector";
import { request_get, request_post } from "@/libs/request_server";
import { REQUEST_TIMEOUT_MS } from "@/constants";
import { validateDomains } from "@/helper/helper.domain";

const TELEGRAM_SAVE_PATH = "/api/setting/telegram/save";
const TELEGRAM_SETTING_BOT_PATH = "/api/setting/telegram/setting_bot";
const TELEGRAM_GROUPS_PATH = "/api/telegram/bot/groups";
const TELEGRAM_OPEN_BOT = "/api/telegram/bot/open";
const TELEGRAM_PROTECTS_PATH = "/api/setting/telegram/protects";

const TELEGRAM_SETTING_KEYS = [
    "botUsername",
    "botToken",
    "is_process",
    "webhookUrl",
    "webhookEnabled",
    "notifyEnabled",
    "silentMode",
    "exceptionLinks"
] as const;

const telegramPayloadSchema = {
    hash_key: z
        .string()
        .min(10, "Invalid data")
        .max(100, "Invalid data")
        .regex(/^[A-Za-z0-9+/=]+$/, "Invalid hash format"),
    botToken: z.string().min(10, "Invalid data").max(100, "Invalid data"),
    is_process: z.boolean().optional(),
    webhookUrl: z.string().optional(),
    webhookEnabled: z.boolean().optional(),
    notifyEnabled: z.boolean().optional(),
    silentMode: z.boolean().optional(),
    exceptionLinks: z.array(z.string()).optional(),
    botUsername: z.string().optional(),
};

class TelegramController extends ProtectController {
    private readonly baseUrl = get_env("BACKEND_URL");

    private pickTelegramSettings(raw: Record<string, unknown>) {
        return make_schema(raw).pick(TELEGRAM_SETTING_KEYS).get();
    }

    private parseEncryptedResponse(encrypted: string): Record<string, unknown> {
        const decoded = HashData.decryptData(encrypted);
        return JSON.parse(decoded) as Record<string, unknown>;
    }

    private handleSaveError(err: unknown): ReturnType<typeof response_data> {
        if (axios.isAxiosError(err)) {
            const ax = err as AxiosError<unknown>;
            if (ax.code === "ECONNABORTED") {
                return response_data(408, 408, "Request timeout (10s)", []);
            }
            if (ax.response) {
                const status = ax.response.status;
                return response_data(status, status, ax.response.statusText ?? "Error", []);
            }
        }
        return response_data(500, 500, "Invalid request", []);
    }

    async save(req: NextRequest) {
        const result = await this.protect(req, telegramPayloadSchema, 10, true);
        if (!result.ok) return result.response!;
        const data = "data" in result ? result.data : undefined;
        if (!data) return response_data(500, 500, "Server error", []);
        const token = data.token;
        const check_links = validateDomains(data.exceptionLinks);
        if (check_links.invalid.length > 0) {
            return response_data(400, 400, `Invalid domain [${check_links.invalid.join(", ")}]`, check_links.invalid);
        }
        if (check_links.duplicates.length > 0) {
            return response_data(400, 400, `Duplicate domain [${check_links.duplicates.join(", ")}]`, check_links.duplicates);
        }
        const payload = make_schema(data as Record<string, unknown>)
            .omit(["token", "botUsername", "exceptionLinks"])
            .extend({ exceptionLinks: check_links.valid })
            .get();
        try {
            const body = HashData.encryptData(JSON.stringify(payload));
            const res = await request_post<{ data: string, code: number, message: string }>({
                url: `${this.baseUrl}${TELEGRAM_SAVE_PATH}`,
                data: { payload: body },
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${token}`,
                },
                timeout: REQUEST_TIMEOUT_MS,
            });
            if (!res?.success || !res.data?.data) return response_data(500, 500, "Server error", []);
            const data = res.data.data;
            const parsed = this.parseEncryptedResponse(data);
            const settings = this.pickTelegramSettings(parsed as Record<string, unknown>);
            return response_data(res.data.code, 200, res.data.message, settings ?? []);
        } catch (err) {
            return this.handleSaveError(err);
        }
    }

    async get_setting_bot(token?: string) {
        if (!token) return defaultTelegramConfig;

        const res = await request_get<{ data: string }>({
            url: `${this.baseUrl}${TELEGRAM_SETTING_BOT_PATH}`,
            headers: { authorization: `Bearer ${token}` },
            timeout: REQUEST_TIMEOUT_MS,
        });

        if (!res?.success || !res.data?.data) return defaultTelegramConfig;
        try {
            const parsed = this.parseEncryptedResponse(res.data.data);
            return this.pickTelegramSettings(parsed as Record<string, unknown>) ?? defaultTelegramConfig;
        } catch {
            return defaultTelegramConfig;
        }
    }

    async get_group_telegram(token?: string) {
        if (!token) return [];
        const res = await request_get<{ groups?: unknown[] }>({
            url: `${this.baseUrl}${TELEGRAM_GROUPS_PATH}`,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            timeout: REQUEST_TIMEOUT_MS,
        });
        if (!res?.success || !res.data) return [];
        const data = res.data as { groups?: unknown[] };
        return Array.isArray(data.groups) ? data.groups : [];
    }

    async bot_open(req: NextRequest) {
        const Schema = {
            hash_key: z.string().min(10, "Invalid data").max(50, "Invalid data"),
            bot_token: z.string().min(10, "Invalid data").max(100, "Invalid data"),
        };
        const result = await this.protect(req, Schema, 10, true);
        if (!result.ok) return result.response!;
        const data = "data" in result ? result.data : undefined;
        if (!data) return response_data(500, 500, "Request error", []);
        const token = data.token;
        const payload = {
            hash_key: data.hash_key,
            bot_token: data.bot_token,
        };
        try {
            const body = HashData.encryptData(JSON.stringify(payload));
            const res = await request_post<{ data: string, code: number, message: string }>({
                url: `${this.baseUrl}${TELEGRAM_OPEN_BOT}`,
                data: { payload: body },
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${token}`,
                },
                timeout: REQUEST_TIMEOUT_MS,
            });
            if (!res?.success || !res.data?.data) return response_data(500, 500, "Server error", []);
            const data = res.data.data;
            const parsed = this.parseEncryptedResponse(data);
            const settings = this.pickTelegramSettings(parsed as Record<string, unknown>);
            return response_data(res.data.code, 200, res.data.message, settings ?? []);
        } catch (err) {
            return this.handleSaveError(err);
        }
    }

    async protects(token?: string) {
        if (!token) return [];
        const res = await request_get<{ data: { protects?: string[] } }>({
            url: `${this.baseUrl}${TELEGRAM_PROTECTS_PATH}`,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            timeout: REQUEST_TIMEOUT_MS,
        });
        if (!res?.success || !res.data?.data) return [];
        const data = res.data.data;
        return data.protects ?? [];
    }
}

export default new TelegramController();
