import { NextRequest } from "next/server";
import axios, { Method, AxiosError } from "axios";
import { z } from "zod";
import { eLog, response_data } from "@/libs/lib";
import HashData from "@/helper/hash_data";
import { make_schema } from "@/helper/helper";
import { defaultTelegramConfig } from "@/default/default";
import { ProtectController } from "./controller_protector";
import { request_get, request_post } from "@/libs/request_server";
import { REQUEST_TIMEOUT_BOT_CLOSE_OPEN_MS, REQUEST_TIMEOUT_MS } from "@/constants";
import { validateDomains } from "@/helper/helper.domain";
import { get_url } from "@/libs/get_urls";
import { ProtectData } from "@/interface/telegram/interface.telegram";
import { ProtectRequestSchema, telegramPayloadSchema } from "@/zod/zod.telegram";
import { error } from "console";
import hash_data from "@/helper/hash_data";

interface ApiResponse<T = unknown> {
    code: number;
    message: string;
    data: T;
}

const TELEGRAM_SETTING_KEYS = [
    "botUsername",
    "botToken",
    "is_process",
    "webhookUrl",
    "webhookEnabled",
    "notifyEnabled",
    "silentMode",
    "exceptionLinks",
] as const;

const botActionSchema = z.object({
    hash_key: z.string().min(10).max(50),
    bot_token: z.string().min(10).max(100),
    method: z.enum(["open", "close"]),
});

const ACTION_CONFIG: Record<string, { method: Method; endpoint: string }> = {
    add: { method: "POST", endpoint: "save_protect_settings" },
    update: { method: "PUT", endpoint: "update_protect_settings" },
    delete: { method: "DELETE", endpoint: "delete_protect_settings" },
}

class TelegramController extends ProtectController {
    private handleError(err: unknown) {
        eLog("[TelegramController Error]:", err);
        if (axios.isAxiosError(err)) {
            const ax = err as AxiosError;
            if (ax.code === "ECONNABORTED") {
                return response_data(408, 408, "Request timeout (10s)", []);
            }
            if (ax.response) {
                return response_data(
                    ax.response.status,
                    ax.response.status,
                    ax.response.statusText || "External API Error",
                    []
                );
            }
        }
        const message = err instanceof Error ? err.message : "Internal Server Error";
        return response_data(500, 500, message, []);
    }

    private getHeaders(token: string) {
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
    }

    private decryptPayload<T>(encrypted: string | null | undefined): T | null {
        if (!encrypted) return null;
        try {
            const decoded = HashData.decryptData(encrypted);
            return JSON.parse(decoded) as T;
        } catch (error) {
            console.error("[Decrypt Error]", error);
            return null;
        }
    }

    private encryptPayload(data: unknown): string {
        return HashData.encryptData(JSON.stringify(data));
    }

    private pickTelegramSettings(raw: Record<string, unknown>) {
        return make_schema(raw).pick(TELEGRAM_SETTING_KEYS).get();
    }

    async save(req: NextRequest) {
        const result = await this.protect(req, telegramPayloadSchema, 10, true);
        if (!result.ok) return result.response!;
        const { data } = result;
        if (!data) return response_data(500, 500, "Validation failed", []);
        const { token, exceptionLinks, ...rest } = data;
        const check_links = validateDomains(exceptionLinks);
        if (check_links.invalid.length > 0) {
            return response_data(400, 400, `Invalid domain(s): ${check_links.invalid.join(", ")}`, check_links.invalid);
        }
        if (check_links.duplicates.length > 0) {
            return response_data(400, 400, `Duplicate domain(s): ${check_links.duplicates.join(", ")}`, check_links.duplicates);
        }

        const payloadData = {
            ...rest,
            exceptionLinks: check_links.valid
        };
        const cleanPayload = make_schema(payloadData).omit(["botUsername"]).get();

        try {
            const encryptedBody = this.encryptPayload(cleanPayload);

            const res = await request_post<ApiResponse<string>>({
                url: get_url("save_bot_settings"),
                data: { payload: encryptedBody },
                headers: this.getHeaders(token),
                timeout: REQUEST_TIMEOUT_MS,
            });

            if (!res.success) throw new Error(res.error);

            const { code, message, data: responseData } = res.data;

            if (code !== 200) {
                return response_data(code, code, message, responseData ?? []);
            }

            const parsed = this.decryptPayload<Record<string, unknown>>(responseData);
            const settings = parsed ? this.pickTelegramSettings(parsed) : [];

            return response_data(code, 200, message, settings);

        } catch (err) {
            return this.handleError(err);
        }
    }

    async get_setting_bot(token?: string) {
        if (!token) return defaultTelegramConfig;
        try {
            const res = await request_get<ApiResponse<{ data: string }>>({
                url: get_url("get_bot_settings"),
                headers: this.getHeaders(token),
                timeout: REQUEST_TIMEOUT_MS,
            });

            if (!res.success || !res.data?.data) return defaultTelegramConfig;

            const encryptedData = res.data.data;
            if (typeof encryptedData !== "string") return defaultTelegramConfig;

            const parsed = this.decryptPayload<Record<string, unknown>>(encryptedData);
            return parsed ? (this.pickTelegramSettings(parsed) ?? defaultTelegramConfig) : defaultTelegramConfig;

        } catch (error) {
            console.error("[get_setting_bot] Failed:", error);
            return defaultTelegramConfig;
        }
    }

    async get_group_telegram(token?: string) {
        if (!token) return [];

        try {
            const res = await request_get<{ groups?: unknown[] }>({
                url: get_url("get_groups"),
                headers: this.getHeaders(token),
                timeout: REQUEST_TIMEOUT_MS,
            });

            if (!res.success || !res.data) return [];
            return Array.isArray(res.data.groups) ? res.data.groups : [];
        } catch (error) {
            console.error("[get_group_telegram] Failed:", error);
            return [];
        }
    }

    async bot_open_close(req: NextRequest) {
        const result = await this.protect(req, botActionSchema, 10, true);
        if (!result.ok) return result.response!;

        const { data } = result;
        if (!data) return response_data(500, 500, "Invalid Request Data", []);

        const { token, hash_key, bot_token, method } = data;

        try {
            const payload = this.encryptPayload({ hash_key, bot_token, method });
            const urlKey = method === "close" ? "close_bot" : "open_bot";
            const res = await request_post<ApiResponse<string>>({
                url: get_url(urlKey),
                data: { payload },
                headers: this.getHeaders(token),
                timeout: REQUEST_TIMEOUT_BOT_CLOSE_OPEN_MS,
            });
            if (!res.success) throw new Error(res.error);
            const { code, message, data: responseData } = res.data;

            if (typeof responseData === "string") {
                const parsed = this.decryptPayload(responseData);
                return response_data(code, code, message, parsed ?? []);
            }

            return response_data(code, code, message, responseData ?? []);

        } catch (err) {
            return this.handleError(err);
        }
    }

    async get_protects(token?: string): Promise<ProtectData | null> {
        if (!token) return null;
        try {
            const res = await request_get<{ data: ProtectData }>({
                url: get_url("get_protect_settings"),
                headers: this.getHeaders(token),
                timeout: REQUEST_TIMEOUT_MS,
            });
            if (!res.success || !res.data?.data) return null;
            return res.data.data;
        } catch (error) {
            console.error("[protects] Failed:", error);
            return null;
        }
    }

    async handleProtect(req: NextRequest): Promise<Response> {
        const result = await this.protect(req, ProtectRequestSchema, 50, true, 120);
        if (!result.ok) return result.response!;
        const { data } = result;
        if (!data) return response_data(500, 500, "Validation failed: No data received", []);

        const { token, ...rest } = data;
        const asset_key = rest.asset_key;
        const action = ACTION_CONFIG[asset_key];

        if (!action) {
            return response_data(400, 400, `Invalid action: ${asset_key}`, []);
        }
        type RequestPayload = typeof rest | { chatId: string };
        let payload: RequestPayload = rest;
        if (asset_key === 'delete') {
            if (!rest.asset?.chatId) {
                return response_data(400, 400, "Missing chatId for deletion", []);
            }
            payload = { chatId: rest.asset.chatId };
        }
        const encryptedBody = hash_data.encryptData(JSON.stringify(payload));
        try {
            const url = get_url(action.endpoint);
            const axiosResponse = await axios.request({
                url,
                method: action.method,
                data: { payload: encryptedBody },
                headers: this.getHeaders(token),
                timeout: REQUEST_TIMEOUT_MS,
                validateStatus: () => true,
            });
            if (axiosResponse.status >= 400) {
                throw new Error(axiosResponse.data?.message || "Request failed");
            }
            const responseData = axiosResponse.data;
            console.log("Response Data:", responseData);
            const { code, message, data } = responseData;
            return response_data(code, code, message, data);
        } catch (error: any) {
            eLog("❌ Handle Protect Error:", error);
            return this.handleError(error);
        }
    }

}

export default new TelegramController();