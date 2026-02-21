import { NextRequest } from "next/server";
import axios, { AxiosError } from "axios";
import { eLog, response_data } from "@/libs/lib";
import { make_schema } from "@/helper/helper";
import { get_url } from "@/libs/get_urls";
import { ProtectController } from "./controller_protector";
import { request_get, request_post } from "@/libs/request_server";
import { REQUEST_TIMEOUT_BOT_CLOSE_OPEN_MS, REQUEST_TIMEOUT_MS } from "@/constants";
import { ACTION_CONFIG, TELEGRAM_SETTING_KEYS } from "@/constants/telegram";
import { validateDomains } from "@/helper/helper.domain";
import { ProtectData, ApiResponse } from "@/interface/interface.telegram";
import { ProtectRequestSchema, telegramPayloadSchema, botActionSchema } from "@/schema/zod.telegram";
import { TelegramBotSettingsConfig } from "@/interface";
import { getErrorMessage } from "@/utils/util";
import { BotAction, ProtectAction } from "../../types/type.telegram";
import { cryptoService } from "@/libs/crypto";


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
        const message = getErrorMessage(err) || "Internal Server Error";
        return response_data(500, 500, message, []);
    }

    private decryptPayload<T>(encrypted: string | null | undefined): T | null {
        if (!encrypted) return null;
        try {
            const decoded = cryptoService.decrypt(encrypted);
            if (!decoded) return null;
            return JSON.parse(decoded) as T;
        } catch (error) {
            eLog("[Decrypt Error]", error);
            return null;
        }
    }

    private encryptPayload(data: unknown): string {
        return cryptoService.encrypt(JSON.stringify(data)) ?? "";
    }

    private pickTelegramSettings(raw: Record<string, unknown>) {
        return make_schema(raw).pick(TELEGRAM_SETTING_KEYS).get();
    }

    public async save_setting_bot(req: NextRequest) {
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

            const { code, message, data } = res.data;

            if (code !== 200) {
                return response_data(code, code, message, data ?? []);
            }

            const parsed = this.decryptPayload<Record<string, unknown>>(data);
            const settings = parsed ? this.pickTelegramSettings(parsed) : [];

            return response_data(code, 200, message, settings);

        } catch (err) {
            return this.handleError(err);
        }
    }

    public async get_setting_bot(token: string): Promise<TelegramBotSettingsConfig | null> {
        if (!token) return null;
        try {
            const res = await request_get<ApiResponse<string>>({
                url: get_url("get_bot_settings"),
                headers: this.getHeaders(token),
                timeout: REQUEST_TIMEOUT_MS,
            });
            if (!res.success) throw new Error(res.error);
            const { code, message, data } = res.data;
            if (code !== 200) {
                eLog("[get_setting_bot] Error:", message);
                return null;
            }
            return this.decryptPayload<TelegramBotSettingsConfig>(data);
        } catch (error) {
            eLog("[get_setting_bot] Failed:", error);
            return null;
        }
    }

    public async get_group_telegram(token?: string) {
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

    public async bot_open_close(req: NextRequest, forcedMethod?: BotAction) {
        const result = await this.protect(req, botActionSchema, 10, true);
        if (!result.ok) return result.response!;

        const { data } = result;
        if (!data) return response_data(500, 500, "Invalid Request Data", []);

        const { token, hash_key, bot_token, method } = data;
        const resolvedMethod = forcedMethod ?? method;

        if (!resolvedMethod) {
            return response_data(400, 400, "Method is required", []);
        }

        if (forcedMethod && method && method !== forcedMethod) {
            return response_data(400, 400, `Invalid method for endpoint: ${forcedMethod}`, []);
        }

        try {
            const payload = this.encryptPayload({ hash_key, bot_token, method: resolvedMethod });
            const urlKey = resolvedMethod === "close" ? "close_bot" : "open_bot";
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

    public async get_protects(token?: string): Promise<ProtectData | null> {
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
            eLog("[protects] Failed:", error);
            return null;
        }
    }

    public async handleProtect(req: NextRequest): Promise<Response> {
        const result = await this.protect(req, ProtectRequestSchema, 50, true, 120);
        if (!result.ok) return result.response!;
        const { data } = result;
        if (!data) return response_data(500, 500, "Validation failed: No data received", []);

        const { token, ...rest } = data;
        const asset_key = rest.asset_key as ProtectAction;
        const action = ACTION_CONFIG[asset_key];
        if (!action) {
            return response_data(400, 400, `Invalid action: ${asset_key}`, []);
        }
        type RequestPayload = typeof rest | { chatId: string };
        let payload: RequestPayload = rest;
        if (asset_key === "delete") {
            if (!rest.asset?.chatId) {
                return response_data(400, 400, "Missing chatId for deletion", []);
            }
            payload = { chatId: String(rest.asset.chatId) };
        }
        const encryptedBody = this.encryptPayload(payload);
        try {
            const response = await axios.request({
                url: get_url(action.endpoint),
                method: action.method,
                data: { payload: encryptedBody },
                headers: this.getHeaders(token),
                timeout: REQUEST_TIMEOUT_MS,
                validateStatus: () => true,
            });
            const { status, statusText } = response;
            if (status !== 200) {
                return response_data(status, status, statusText || "Request failed", []);
            };
            const { code, message, data } = response.data;
            return response_data(code, code, message, data);
        } catch (error: unknown) {
            eLog("Handle Protect Error:", error);
            return this.handleError(error);
        }
    }

}
const telegramController = new TelegramController();
export default telegramController;
