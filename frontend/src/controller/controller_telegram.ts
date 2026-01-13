import { NextRequest } from "next/server";
import { ProtectMiddleware } from "@/middleware/middleware_protect";
import axios from "axios";
import { z } from "zod";
import { get_env } from "@/libs/lib";
import { response_data } from "@/libs/lib";
import HashData from "@/helper/hash_data";
import { make_schema } from "@/helper/helper";
import { defaultTelegramConfig } from "@/default/default";


class TelegramController extends ProtectMiddleware {
    private readonly json_protector = {
        hash_key: z.string().min(10, "Invalid data").max(100, "Invalid data").regex(/^[A-Za-z0-9+/=]+$/, "Invalid hash format"),
        botToken: z.string().min(10, "Invalid data").max(100, "Invalid data"),
        webhookUrl: z.string().optional(),
        webhookEnabled: z.boolean().optional(),
        notifyEnabled: z.boolean().optional(),
        silentMode: z.boolean().optional(),
    };
    private readonly pick_schema = ["botUsername", "botToken", "webhookUrl", "webhookEnabled", "notifyEnabled", "silentMode"];

    async save(req: NextRequest) {
        const result = await this.protect(req, this.json_protector, 10, true);
        if (result !== true) return result;
        const token = this.data.token;
        const format_data = make_schema(this.data as Record<string, any>).omit(["token"]).get();
        try {
            const ApiUrl = get_env("BACKEND_URL");
            const post_body = HashData.encryptData(JSON.stringify(format_data));
            const res = await axios.post(
                `${ApiUrl}/api/setting/telegram/save`,
                { payload: post_body },
                {
                    timeout: 10_000,
                    headers: {
                        "Content-Type": "application/json",
                        "authorization": `Bearer ${token}`,
                    },
                }
            );
            const formatData = HashData.decryptData(res.data.data);
            const collections = JSON.parse(formatData);
            const pickSchema = make_schema(collections as Record<string, any>).pick(this.pick_schema).get();
            return response_data(res.data.code, 200, res.data.message, pickSchema || []);
        } catch (err: any) {
            if (axios.isAxiosError(err) && err.code === "ECONNABORTED") {
                return response_data(408, 408, "Request timeout (10s)", []);
            }
            if (axios.isAxiosError(err) && err.response) {
                return response_data(err.response.status, err.response.status, err.response.statusText, []);
            }
            return response_data(500, 500, "Invalid request", []);
        }
    }

    async get_setting_bot(token?: string) {
        if (!token) {
            return defaultTelegramConfig;
        }
        const ApiUrl = get_env("BACKEND_URL");
        try {
            const res = await axios.get(
                `${ApiUrl}/api/setting/telegram/setting_bot`,
                {
                    timeout: 10_000,
                    headers: {
                        authorization: `Bearer ${token}`
                    }
                });
            const formatData = HashData.decryptData(res.data.data);
            const collections = JSON.parse(formatData);
            const pickSchema = make_schema(collections as Record<string, any>).pick(this.pick_schema).get();
            return pickSchema;
        } catch (err: any) {
            if (axios.isAxiosError(err) && err.code === "ECONNABORTED") {
                return defaultTelegramConfig;
            }
            if (axios.isAxiosError(err) && err.response) {
                return defaultTelegramConfig;
            }
            return defaultTelegramConfig;
        }
    }
}
export default new TelegramController;