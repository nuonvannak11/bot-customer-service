import { NextRequest } from "next/server";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import { response_data } from "@/libs/lib";
import HashData from "@/helper/hash_data";
import { make_schema } from "@/helper/helper";
import { defaultTelegramConfig } from "@/default/default";
import { ProtectController } from "./controller_protector";
import { request_get, request_post } from "@/libs/request_server";
import { REQUEST_TIMEOUT_MS } from "@/constants";
import { validateDomains } from "@/helper/helper.domain";
import { get_url } from "@/libs/get_urls";

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

interface ResponseApi {
    code: number;
    message: string;
    data: string[] | string | null;
}


class TelegramController extends ProtectController {
    private pickTelegramSettings(raw: Record<string, unknown>) {
        return make_schema(raw).pick(TELEGRAM_SETTING_KEYS).get();
    }

    private parseEncryptedResponse(encrypted: string): Record<string, unknown> {
        if (!encrypted) return {};
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
                url: get_url("save_bot_settings"),
                data: { payload: body },
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${token}`,
                },
                timeout: REQUEST_TIMEOUT_MS,
            });
            if (!res.success) {
                throw new Error(res.error);
            }
            const { data, code, message } = res.data;
            if (code !== 200) {
                return response_data(code, code, message, data ?? []);
            }
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
            url: get_url("get_bot_settings"),
            headers: { authorization: `Bearer ${token}` },
            timeout: REQUEST_TIMEOUT_MS,
        });

        if (!res?.success || !res.data?.data) return defaultTelegramConfig;
        try {
            const data = res.data.data;
            if (typeof data !== "string") return defaultTelegramConfig;
            const parsed = this.parseEncryptedResponse(data);
            return this.pickTelegramSettings(parsed as Record<string, unknown>) ?? defaultTelegramConfig;
        } catch {
            return defaultTelegramConfig;
        }
    }

    async get_group_telegram(token?: string) {
        try {
            if (!token) return [];
            const res = await request_get<{ groups?: unknown[] }>({
                url: get_url("get_groups"),
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                timeout: REQUEST_TIMEOUT_MS,
            });
            if (!res?.success || !res.data) return [];
            const data = res.data as { groups?: unknown[] };
            return Array.isArray(data.groups) ? data.groups : [];
        } catch (error) {
            return this.handleSaveError(error);
        }
    }

    async bot_open_close(req: NextRequest) {
        const Schema = {
            hash_key: z.string().min(10, "Invalid data").max(50, "Invalid data"),
            bot_token: z.string().min(10, "Invalid data").max(100, "Invalid data"),
            method: z.enum(["open", "close"]),
        };
        const result = await this.protect(req, Schema, 10, true);
        if (!result.ok) return result.response!;
        const data = "data" in result ? result.data : undefined;
        if (!data) return response_data(500, 500, "Request error", []);
        const { token, hash_key, bot_token, method } = data;
        try {
            const encrypted = HashData.encryptData(JSON.stringify({ hash_key, bot_token, method }));
            const res = await request_post<ResponseApi>({
                url: get_url(method === "close" ? "close_bot" : "open_bot"),
                data: { payload: encrypted },
                headers: {
                    "Content-Type": "application/json",
                    authorization: `Bearer ${token}`,
                },
                timeout: REQUEST_TIMEOUT_MS,
            });
            if (!res.success) {
                throw new Error(res.error);
            }
            const { code, message, data } = res.data;
            if (typeof data !== "string") {
                return response_data(code, code, message, data ?? []);
            }
            const parsed = this.parseEncryptedResponse(data);
            return response_data(code, code, message, parsed ?? []);
        } catch (err) {
            return this.handleSaveError(err);
        }
    }

    async protects(token?: string) {
        try {
            if (!token) return [];
            const res = await request_get<{ data: { protects?: string[] } }>({
                url: get_url("get_protect_settings"),
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                timeout: REQUEST_TIMEOUT_MS,
            });
            if (!res?.success || !res.data?.data) return [];
            const data = res.data.data;
            return data.protects ?? [];
        } catch (error) {
            return this.handleSaveError(error);
        }
    }
}

export default new TelegramController();
