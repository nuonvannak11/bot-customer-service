import { NextRequest } from "next/server";
import axios from "axios";
import { z } from "zod";
import { get_env, eLog, check_header } from "@/libs/lib";
import { response_data } from "@/libs/lib";
import HashData from "@/helper/hash_data";
import HashKey from "@/helper/hash_key";
import { empty } from "@/utils/util";
import { rate_limit } from "@/helper/ratelimit";
import { PHONE_REGEX, SAFE_TEXT } from "@/constants";
import { ProtectMiddleware } from "@/middleware/middleware_protect";
import { AuthResponse } from "@/types/type";

class UserController extends ProtectMiddleware {

    private json_protector = {
        phone: z
            .string()
            .min(7, "Phone is required")
            .max(15, "Phone is too long")
            .regex(PHONE_REGEX, "Invalid phone number format")
            .transform((v) => v.replace(/\D/g, "")),
        password: z
            .string()
            .min(1, "Password is required")
            .max(20, "Password is too long")
            .regex(SAFE_TEXT, "Invalid characters!")
            .transform((v) => v.trim()),
        hash_key: z
            .string()
            .min(1, "Invalid data")
            .max(100, "Invalid data")
            .regex(/^[A-Za-z0-9+/=]+$/, "Invalid hash format"),
    };

    public async check_auth(token?: string): Promise<AuthResponse> {
        if (!token) {
            return { code: 401, message: "Unauthorized", data: [] };
        }
        const ApiUrl = get_env("BACKEND_URL");
        try {
            const res = await axios.get(`${ApiUrl}/auth/check_auth`, {
                timeout: 10_000,
                headers: {
                    authorization: `Bearer ${token}`,
                },
            });
            return { code: res.data.code, message: res.data.message, data: res.data.data ?? [] };
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                if (err.code === "ECONNABORTED") {
                    return { code: 408, message: "Request timeout (10s)", data: [] };
                }
                if (err.response) {
                    return { code: err.response.status, message: err.response.statusText || "Request Error", data: [] };
                }
            }
            return { code: 500, message: "Internal Server Error", data: [] };
        }
    }

    public async login(req: NextRequest) {
        const Schema = z.object(this.json_protector).strict();
        try {
            const header = check_header(req);
            if (!header) {
                return response_data(403, 403, "Forbidden", []);
            }
            const body = await req.json();
            const validation = Schema.safeParse(body);
            if (!validation.success) {
                return response_data(400, 400, validation.error.issues[0].message, []);
            }
            if (this.hasDangerousKeys(validation.data)) {
                return response_data(400, 400, "Invalid data", []);
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
            const apiUrl = get_env("BACKEND_URL");
            const payload = HashData.encryptData(JSON.stringify({ phone, password, hash_key }));
            const response = await axios.post(
                `${apiUrl}/auth/login`,
                { payload },
                {
                    timeout: 5_000,
                    headers: { "Content-Type": "application/json" },
                }
            );
            const data = response.data;
            const res = response_data(data.code, 200, data.message, []);
            res.cookies.set("authToken", data.token, {
                httpOnly: true,
                secure: get_env("NODE_ENV") === "production",
                path: "/",
                sameSite: "strict",
                maxAge: 60 * 60 * 24 * 7,
            });
            return res;
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

    public async register(req: NextRequest) {
        const Schema = z.object(this.json_protector)
            .extend({
                username: z.string().min(1, "Username is required").max(20, "Username is too long").regex(SAFE_TEXT, "Invalid characters!"),
            }).strict();

        try {
            const header = check_header(req);
            if (!header) {
                return response_data(403, 403, "Forbidden", []);
            }
            const body = await req.json();
            const validation = Schema.safeParse(body);
            if (!validation.success) {
                return response_data(400, 400, validation.error.issues[0].message, []);
            }
            if (this.hasDangerousKeys(validation.data)) {
                return response_data(400, 400, "Invalid data", []);
            }
            const { phone, password, username, hash_key } = validation.data;
            const decrypt_key = HashKey.decrypt(hash_key);
            if (!decrypt_key) {
                return response_data(400, 400, "Invalid data", []);
            }
            const rl = await rate_limit(hash_key, 5, 120);
            if (!rl.allowed) {
                return response_data(429, 429, "Too many requests", []);
            }
            const apiUrl = get_env("BACKEND_URL");
            const payload = HashData.encryptData(JSON.stringify({ phone, password, username, hash_key }));
            const response = await axios.post(
                `${apiUrl}/auth/register`,
                { payload },
                {
                    timeout: 10_000,
                    headers: { "Content-Type": "application/json" },
                }
            );
            const data = response.data;
            return response_data(data.code, 200, data.message, data.data || []);
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

    public async verify_otp(req: NextRequest) {
        const Schema = z.object(this.json_protector)
            .extend({
                code: z.string().min(1, "Code is required").max(7, "Code is too long"),
            }).omit({ password: true }).strict();

        try {
            const header = check_header(req);
            if (!header) {
                return response_data(403, 403, "Forbidden", []);
            }
            const body = await req.json();
            const validation = Schema.safeParse(body);
            if (!validation.success) {
                return response_data(400, 400, validation.error.issues[0].message, []);
            }
            if (this.hasDangerousKeys(validation.data)) {
                return response_data(400, 400, "Invalid data", []);
            }
            const { phone, code, hash_key } = validation.data;
            const decrypt_key = HashKey.decrypt(hash_key);
            if (empty(decrypt_key)) {
                return response_data(400, 400, "Invalid data", []);
            }
            const rl = await rate_limit(hash_key, 5, 120);
            if (!rl.allowed) {
                return response_data(429, 429, "Too many requests", []);
            }
            const apiUrl = get_env("BACKEND_URL");
            const payload = HashData.encryptData(JSON.stringify({ phone, code, hash_key }));
            const response = await axios.post(
                `${apiUrl}/auth/verify_phone`,
                { payload },
                {
                    timeout: 10_000,
                    headers: { "Content-Type": "application/json" },
                }
            );
            const data = response.data;
            const res = response_data(data.code, 200, data.message, []);
            res.cookies.set("authToken", data.token, {
                httpOnly: true,
                secure: get_env("NODE_ENV") === "production",
                path: "/",
                sameSite: "strict",
                maxAge: 60 * 60 * 24 * 7,
            });
            return res;
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

    public async resent_otp(req: NextRequest) {
        const Schema = z.object(this.json_protector).omit({ password: true }).strict();
        try {
            const header = check_header(req);
            if (!header) {
                return response_data(403, 403, "Forbidden", []);
            }
            const body = await req.json();
            const validation = Schema.safeParse(body);
            if (!validation.success) {
                return response_data(400, 400, validation.error.issues[0].message, []);
            }
            if (this.hasDangerousKeys(validation.data)) {
                return response_data(400, 400, "Invalid data", []);
            }
            const { phone, hash_key } = validation.data;
            const decrypt_key = HashKey.decrypt(hash_key);
            if (empty(decrypt_key)) {
                return response_data(400, 400, "Invalid data", []);
            }
            const rl = await rate_limit(hash_key, 5, 120);
            if (!rl.allowed) {
                return response_data(429, 429, "Too many requests", []);
            }
            const apiUrl = get_env("BACKEND_URL");
            const payload = HashData.encryptData(JSON.stringify({ phone, hash_key }));
            const response = await axios.post(
                `${apiUrl}/auth/resend_code`,
                { payload },
                {
                    timeout: 5_000,
                    headers: { "Content-Type": "application/json" },
                }
            );
            const data = response.data;
            return response_data(data.code, 200, data.message, data.data || []);
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

    public async googleLogin(req: Request, res: Response) {
        try {

        } catch (err) {
        }
    }

    public async logout(req: NextRequest) {
        try {
            const header = check_header(req);
            if (!header) {
                return response_data(403, 403, "Forbidden", []);
            }
            req.cookies.delete("authToken");
            return response_data(200, 200, "Logout successfully", []);
        } catch (err: any) {
            eLog("Login Proxy Error:", err);
            return response_data(500, 500, "Internal Server Error", []);
        }
    }

}
export default new UserController;