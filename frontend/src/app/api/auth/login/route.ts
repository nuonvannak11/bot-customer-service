import { NextResponse, NextRequest } from "next/server";
import axios from "axios";
import { z } from "zod";
import { get_env, eLog, check_header } from "@/libs/lib";
import { response_data } from "@/libs/lib";
import HashData from "@/helper/hash_data";
import HashKey from "@/helper/hash_key";
import { empty } from "@/utils/util";
import { rate_limit } from "@/helper/ratelimit";

const LoginSchema = z.object({
    phone: z.string().min(1, "Phone is required").max(15, "Phone is too long"),
    password: z.string().min(1, "Password is required").max(20, "Password is too long"),
    hash_key: z.string().min(1, "Invalid data").max(100, "Invalid data"),
}).strict();

export async function POST(req: NextRequest) {
    try {
        const header = check_header(req);
        if (!header) {
            return response_data(403, 403, "Forbidden", []);
        }
        const body = await req.json();
        const validation = LoginSchema.safeParse(body);
        if (!validation.success) {
            return response_data(400, 400, validation.error.issues[0].message, []);
        }
        const { phone, password, hash_key } = validation.data;
        const decrypt_key = HashKey.decrypt(hash_key);
        if (empty(decrypt_key)) {
            return response_data(400, 400, "Invalid data", []);
        }
        const rl = await rate_limit(hash_key, 5, 120);
        if (!rl.allowed) {
            return response_data(429, 429, "Too many requests", []);
        }
        return response_data(200, 200, "Success", []);

        const apiUrl = get_env("BACKEND_URL");
        const payload = HashData.encryptData(JSON.stringify({ phone, password }));
        const response = await axios.post(
            `${apiUrl}/auth/login`,
            { payload },
            {
                timeout: 10_000,
                headers: { "Content-Type": "application/json" },
            }
        );
        return NextResponse.json(response.data, { status: 200 });
    } catch (err: any) {
        eLog("Login Proxy Error:", err);
        if (axios.isAxiosError(err)) {
            if (err.code === "ECONNABORTED") {
                return response_data(408, 408, "Request timeout (10s)", []);
            }
            if (err.response) {
                const backendMessage = err.response.data?.message || err.response.statusText;
                return response_data(err.response.status, err.response.status, backendMessage, []);
            }
        }
        return response_data(500, 500, "Internal Server Error", []);
    }
}