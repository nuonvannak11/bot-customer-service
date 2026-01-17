import { NextRequest } from "next/server";
import axios from "axios";
import { z } from "zod";
import { get_env, eLog, check_header } from "@/libs/lib";
import { response_data } from "@/libs/lib";
import HashData from "@/helper/hash_data";
import HashKey from "@/helper/hash_key";
import { empty } from "@/utils/util";
import { rate_limit } from "@/helper/ratelimit";
import { PHONE_REGEX, SAFE_TEXT, EMAIL_REGEX } from "@/constants";
import { AuthResponse } from "@/types/type";
import { defaultUserProfileConfig } from "@/default/default";
import { UserProfileConfig } from "@/interface";
import { parse_user_profile } from "@/parser";
import controller_r2 from "./controller_r2";
import { ProtectController } from "./controller_protector";

class UserController extends ProtectController {
    private time_ratelimit = {
        update_profile: 120,
        login: 120,
        register: 120,
        verify_otp: 120,
        resent_otp: 120,
    }
    private number_ratelimit = {
        update_profile: 10
    }
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

    private isEmailValid(email?: string): boolean {
        if (!email) {
            return false;
        }
        return EMAIL_REGEX.test(email);
    }

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
            const format_data = HashData.decryptData(res.data.data);
            const collections = JSON.parse(format_data);
            return { code: res.data.code, message: res.data.message, data: collections ?? [] };
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

    public async get_user_profile(token?: string): Promise<UserProfileConfig> {
        if (!token) {
            return defaultUserProfileConfig;
        }
        const ApiUrl = get_env("BACKEND_URL");
        try {
            const res = await axios.get(`${ApiUrl}/auth/get_user_profile`, {
                timeout: 10_000,
                headers: {
                    authorization: `Bearer ${token}`,
                },
            });
            if (res.data.code !== 200) {
                return defaultUserProfileConfig;
            }
            const formatData = HashData.decryptData(res.data.data);
            const collections = JSON.parse(formatData);
            return parse_user_profile(collections);
        } catch (err: any) {
            return defaultUserProfileConfig;
        }
    }

    public async update_user_profile(req: NextRequest) {
        const Schema = z.object(this.json_protector).omit({ password: true, phone: true }).extend({
            isAvatarUpdated: z.string().optional(),
            avatar: z.string().optional(),
            fullName: z.string().optional(),
            username: z.string().optional(),
            email: z.string().optional(),
            phone: z.string().optional(),
            bio: z.string().optional(),
            emailNotifications: z.string().optional(),
            twoFactor: z.string().optional(),
        }).strict();

        try {
            const number_limit = this.number_ratelimit.update_profile;
            const time_limit = this.time_ratelimit.update_profile;
            const results = await this.protect(req, Schema.shape, number_limit, true, time_limit);
            if (!results.ok) {
                return results.response;
            }
            const { data, form } = results;
            if (!data) {
                return response_data(400, 400, "Invalid data", []);
            }
            if (!empty(data.email) && !this.isEmailValid(data.email)) {
                return response_data(400, 400, "Invalid email", []);
            }
            const token = data?.token;
            const isAvatarUpdate = data.isAvatarUpdated === "true";
            if (isAvatarUpdate) {
                const updateAvatar = await this.protect_file({ form: form || undefined, field: "updateAvatar", maxSizeMB: 10 });
                if (!updateAvatar.ok) {
                    return response_data(400, 400, updateAvatar.error || "Invalid file", []);
                }
                const parseData = await this.parse_token(token);
                if (!parseData) {
                    return response_data(401, 401, "Unauthorized", []);
                }
                const user_id = parseData.user_id;
                const path_img = "assets/img/user";
                const file = updateAvatar.file;
                const upload_avatar = await controller_r2.req_upload(token, file, path_img, user_id);
                if (empty(upload_avatar)) {
                    return response_data(400, 400, "error upload avatar", []);
                }
                data.avatar = upload_avatar ?? undefined;
            }
            const post_body = HashData.encryptData(JSON.stringify(data));
            const apiUrl = get_env("BACKEND_URL");
            const response = await axios.patch(
                `${apiUrl}/api/user/profile/update`,
                { payload: post_body },
                {
                    timeout: 10_000,
                    headers: {
                        "Content-Type": "application/json",
                        "authorization": `Bearer ${token}`,
                    },
                }
            );
            const res_data = response.data;
            const formatData = HashData.decryptData(res_data.data);
            const collection = JSON.parse(formatData);
            return response_data(res_data.code, res_data.code, res_data.message, collection);
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
}
export default new UserController;