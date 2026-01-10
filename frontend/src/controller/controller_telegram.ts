import { NextRequest } from "next/server";
import { ProtectMiddleware } from "@/middleware/middleware_protect";
import axios from "axios";
import { z } from "zod";
import { get_env } from "@/libs/lib";
import { response_data } from "@/libs/lib";
import HashData from "@/helper/hash_data";
import { make_schema } from "@/helper/helper";


class TelegramController extends ProtectMiddleware {
    async save(req: NextRequest) {
        const result = await this.protect(req, {
            hash_key: z.string().min(10, "Invalid data").max(100, "Invalid data").regex(/^[A-Za-z0-9+/=]+$/, "Invalid hash format"),
            botToken: z.string().min(10, "Invalid data").max(100, "Invalid data"),
            webhookUrl: z.string().optional(),
            webhookEnabled: z.boolean().optional(),
            notifyEnabled: z.boolean().optional(),
            silentMode: z.boolean().optional(),
        }, true);
        if (!result) return result;
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
            return response_data(res.data.code, 200, res.data.message, res.data.data || []);
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
}
export default new TelegramController;