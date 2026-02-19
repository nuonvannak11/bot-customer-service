import { NextRequest } from "next/server";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import { get_env, eLog, check_header } from "@/libs/lib";
import { response_data } from "@/libs/lib";
import cryptoService from "@/libs/crypto";
import { empty } from "@/utils/util";
import { SAFE_TEXT, EMAIL_REGEX, REQUEST_TIMEOUT_MS } from "@/constants";
import { ApiResponse, AuthResponse, LoginResponse, OTPResponse } from "@/types/type";
import { CheckAuthResponse, UserProfileConfig } from "@/interface";
import controller_r2 from "./controller_r2";
import { ProtectController } from "./controller_protector";
import { request_get, request_patch, request_post } from "@/libs/request_server";
import { get_url } from "@/libs/get_urls";
import { JSON_PROTECTOR, SchemaUpdateUserProfile } from "@/schema/zod.user";

class UserController extends ProtectController {
    private getHeaders(token: string) {
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
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

    private isEmailValid(email?: string): boolean {
        if (!email) {
            return false;
        }
        return EMAIL_REGEX.test(email);
    }

    public async check_auth(token: string): Promise<CheckAuthResponse | null> {
        if (!token) return null;
        try {
            const res = await request_get<AuthResponse<string>>({
                url: get_url("check_auth"),
                headers: this.getHeaders(token),
                timeout: 10_000
            });
            if (!res.success) throw new Error(res.error);
            const { code, message, data } = res.data;
            if (code !== 200) {
                eLog("[check_auth] Error:", message);
                return null;
            }
            return this.decryptPayload<CheckAuthResponse>(data);
        } catch (err: unknown) {
            eLog("[check_auth] Failed:", err);
            return null;
        }
    }

    public async login(req: NextRequest) {
        try {
            const Schema = z.object(JSON_PROTECTOR).strict();
            const results = await this.protect(req, Schema.shape, 10, false, 120);
            if (!results.ok) return results.response;
            const validData = results.data;
            if (!validData) {
                return response_data(400, 400, "Invalid data", []);
            }
            const { phone, password, hash_key } = validData;
            const payload = cryptoService.encryptObject({ phone, password, hash_key });
            const response = await request_post<LoginResponse>({
                url: get_url("login"),
                data: { payload },
                timeout: 10_000,
                headers: { "Content-Type": "application/json" },
            });
            if (!response.success) {
                return response_data(400, 400, response.error, []);
            }
            const { code, message, token } = response.data;
            const res = response_data(code, code, message, token);
            res.cookies.set("authToken", token, {
                httpOnly: true,
                secure: get_env("NODE_ENV") === "production",
                path: "/",
                sameSite: "strict",
                maxAge: 60 * 60 * 24 * 7,
            });
            return res;
        } catch (err: unknown) {
            eLog("Login Proxy Error:", err);
            return this.handleSaveError(err);
        }
    }

    public async register(req: NextRequest) {
        try {
            const Schema = z.object(JSON_PROTECTOR).extend({ username: z.string().min(1, "Username is required").max(20, "Username is too long").regex(SAFE_TEXT, "Invalid characters!") }).strict();
            const results = await this.protect(req, Schema.shape, 10, false, 120);
            if (!results.ok) return results.response;
            const validData = results.data;
            if (!validData) {
                return response_data(400, 400, "Invalid data", []);
            }
            const { phone, password, username, hash_key } = validData;
            const payload = cryptoService.encryptObject({ phone, password, username, hash_key });
            const response = await request_post<ApiResponse<string>>({
                url: get_url("register"),
                data: { payload },
                timeout: REQUEST_TIMEOUT_MS,
                headers: { "Content-Type": "application/json" },
            });
            if (!response.success) {
                return response_data(400, 400, response.error, []);
            }
            const { code, message, data } = response.data;
            return response_data(code, 200, message, data || []);
        } catch (err: unknown) {
            eLog("Login Proxy Error:", err);
            return this.handleSaveError(err);
        }
    }

    public async verify_otp(req: NextRequest) {
        try {
            const Schema = z.object(JSON_PROTECTOR).extend({ code: z.string().min(1, "Code is required").max(7, "Code is too long") }).omit({ password: true }).strict();
            const results = await this.protect(req, Schema.shape, 5, false, 120);
            if (!results.ok) return results.response;
            const validData = results.data;
            if (!validData) {
                return response_data(400, 400, "Invalid data", []);
            }
            const { phone, code, hash_key } = validData;
            const payload = cryptoService.encryptObject({ phone, code, hash_key });
            const response = await request_post<OTPResponse<string>>({
                url: get_url("verify_phone"),
                data: { payload },
                headers: { "Content-Type": "application/json" },
                timeout: REQUEST_TIMEOUT_MS,
            });
            if (!response.success) {
                return response_data(400, 400, response.error, []);
            }
            const { code: codeResponse, message, token } = response.data;
            if (codeResponse !== 200) {
                return response_data(codeResponse, codeResponse, message, [])
            }
            const res = response_data(codeResponse, codeResponse, message, token);
            res.cookies.set("authToken", token, {
                httpOnly: true,
                secure: get_env("NODE_ENV") === "production",
                path: "/",
                sameSite: "strict",
                maxAge: 60 * 60 * 24 * 7,
            });
            return res;
        } catch (err: unknown) {
            eLog("Login Proxy Error:", err);
            return this.handleSaveError(err);
        }
    }

    public async resent_otp(req: NextRequest): Promise<Response> {
        try {
            const Schema = z.object(JSON_PROTECTOR).omit({ password: true }).strict();
            const results = await this.protect(req, Schema.shape, 5, false, 120);
            if (!results.ok) return results.response;
            const validData = results.data;
            if (!validData) {
                return response_data(400, 400, "Invalid data", []);
            }
            const { phone, hash_key } = validData;
            const payload = cryptoService.encryptObject({ phone, hash_key });
            const response = await request_post<ApiResponse<string>>({
                url: get_url("resend_code"),
                data: { payload },
                timeout: REQUEST_TIMEOUT_MS,
                headers: { "Content-Type": "application/json" },
            });
            if (!response.success) {
                return response_data(400, 400, response.error, []);
            }
            const { code, message, data } = response.data;
            return response_data(code, code, message, data);
        } catch (err: unknown) {
            eLog("Login Proxy Error:", err);
            return this.handleSaveError(err);
        }
    }

    public async googleLogin(req: Request, res: Response) {
        try {
            console.log(res, req)
        } catch (err: unknown) {
            eLog("Login Proxy Error:", err);
            return this.handleSaveError(err);
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
        } catch (err: unknown) {
            eLog("Login Proxy Error:", err);
            return response_data(500, 500, "Internal Server Error", []);
        }
    }

    public async get_user_profile(token: string): Promise<UserProfileConfig | null> {
        if (!token) return null;
        try {
            const response = await request_get<ApiResponse<string>>({
                url: get_url("user_profile"),
                timeout: REQUEST_TIMEOUT_MS,
                headers: this.getHeaders(token),
            });
            if (!response.success) {
                return null;
            }
            const { code, message, data } = response.data;
            if (code !== 200) {
                eLog("[get_user_profile] Error:", message);
                return null;
            }
            return this.decryptPayload<UserProfileConfig>(data);
        } catch (err: unknown) {
            eLog("[get_user_profile] Failed:", err);
            return null;
        }
    }

    public async update_user_profile(req: NextRequest): Promise<Response> {
        try {
            const results = await this.protect(req, SchemaUpdateUserProfile.shape, 10, true, 120);
            if (!results.ok) return results.response;
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
                const parseToken = this.parse_token(token);
                if (!parseToken) {
                    return response_data(401, 401, "Unauthorized", []);
                }
                const user_id = parseToken.user_id;
                const path_img = "assets/img/user";
                const file = updateAvatar.file;
                const upload_avatar = await controller_r2.req_upload(token, file, path_img, user_id);
                if (empty(upload_avatar)) {
                    return response_data(400, 400, "error upload avatar", []);
                }
                data.avatar = upload_avatar ?? undefined;
            }
            const payload = cryptoService.encryptObject(data);
            const response = await request_patch<ApiResponse<string>>({
                url: get_url("update_user_profile"),
                data: { payload },
                timeout: REQUEST_TIMEOUT_MS,
                headers: this.getHeaders(token),
            });
            if (!response.success) {
                return response_data(400, 400, response.error, []);
            }
            const { code, message, data: responseData } = response.data;
            if (code !== 200) {
                return response_data(code, code, message, []);
            }
            const formatData = this.decryptPayload<UserProfileConfig>(responseData);
            return response_data(code, code, message, formatData);
        } catch (err: unknown) {
            eLog("Login Proxy Error:", err);
            return this.handleSaveError(err);
        }
    }
}
const userController = new UserController();
export default userController;