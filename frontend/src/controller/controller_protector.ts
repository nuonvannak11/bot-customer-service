import { NextRequest } from "next/server";
import { z } from "zod";
import { eLog, response_data, check_header } from "@/libs/lib";
import { cryptoService } from "@/libs/crypto";
import { RateLimiter } from "@/helper/ratelimit";
import { fileTypeFromBuffer } from "file-type";
import { ParseJWTPayload, ProtectFileOptions } from "@/interface";
import { dangerousKeys, default_extensions_img } from "@/constants";
import { isZodObject } from "@/schema/zod";
import { ProtectDataFor, ProtectDataWithToken, ProtectResult, ShapeRecord } from "../../types/type";
import jwtService from "@/libs/jwt";

export class ProtectController {
    public expireAt(days: number): number {
        return 60 * 60 * 24 * days;
    }

    private async get_body(req: NextRequest) {
        try {
            const contentType = req.headers.get("content-type") || "";

            if (contentType.includes("application/json")) {
                return { body: await req.json(), form: null };
            }
            if (contentType.includes("multipart/form-data")) {
                const form = await req.formData();
                const body: Record<string, unknown> = {};
                for (const [key, value] of form.entries()) {
                    if (value instanceof File) continue;
                    body[key] = value.toString();
                }
                return { body, form };
            }
            if (contentType.includes("application/x-www-form-urlencoded")) {
                const text = await req.text();
                return { body: Object.fromEntries(new URLSearchParams(text)), form: null };
            }
            return { body: {}, form: null };
        } catch (err) {
            eLog("❌ get_body error:", err);
            return { body: {}, form: null };
        }
    }

    public getHeaders(token: string) {
        return {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        };
    }

    public async protect_file({ form, field, maxSizeMB = 5, allowed = default_extensions_img }: ProtectFileOptions) {
        if (!form) return { ok: false, error: "Missing form data" };

        const file = form.get(field);
        if (!file || !(file instanceof File)) {
            return { ok: false, error: `Field ${field} is missing or not a valid File` };
        }

        if (file.size > maxSizeMB * 1024 * 1024) {
            return { ok: false, error: `File ${field} exceeds ${maxSizeMB}MB limit` };
        }

        if (!allowed.includes(file.type)) {
            return { ok: false, error: `File type not allowed: ${file.type}` };
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        if (file.type === "image/svg+xml") {
            return { ok: true, file, buffer, ext: "svg", mime: "image/svg+xml" };
        }

        const detected = await fileTypeFromBuffer(buffer);
        if (!detected || !allowed.includes(detected.mime)) {
            return { ok: false, error: `File content mismatch for field ${field}` };
        }

        return { ok: true, file, buffer, ext: detected.ext, mime: detected.mime };
    }

    public hasDangerousKeys(obj: unknown): boolean {
        if (obj === null || typeof obj !== "object") return false;
        if (obj instanceof File || obj instanceof Blob) return false;

        if (Array.isArray(obj)) {
            return obj.some((item) => this.hasDangerousKeys(item));
        }

        for (const [key, value] of Object.entries(obj)) {
            if (dangerousKeys.has(key) || key.startsWith("$") || key.includes(".")) {
                return true;
            }
            if (typeof value === "object" && this.hasDangerousKeys(value)) {
                return true;
            }
        }
        return false;
    }

    public extractToken(req: NextRequest): string | null {
        return req.cookies.get("access_token")?.value || null;
    }

    public async parse_token(token: string): Promise<ParseJWTPayload | null> {
        if (!token) return null;
        const ensureToken = await jwtService.verifyToken(token);
        if (!ensureToken.success || !ensureToken.data) return null;
        return ensureToken.data;
    }

    public async protect<T extends ShapeRecord | z.ZodObject<z.ZodRawShape>>(req: NextRequest, json_protector: T, ratlimit?: number, check_token?: false, time_limit?: number): Promise<ProtectResult<ProtectDataFor<T>>>;
    public async protect<T extends ShapeRecord | z.ZodObject<z.ZodRawShape>>(req: NextRequest, json_protector: T, ratlimit: number, check_token: true, time_limit?: number): Promise<ProtectResult<ProtectDataWithToken<T>>>;
    public async protect<T extends ShapeRecord | z.ZodObject<z.ZodRawShape>>(
        req: NextRequest,
        json_protector: T,
        ratlimit = 5,
        check_token = false,
        time_limit = 120
    ): Promise<ProtectResult<any>> {
        try {
            if (!check_header(req)) {
                return { ok: false, response: response_data(403, 403, "Forbidden", []) };
            }
            let token = null;
            if (check_token) {
                token = this.extractToken(req);
                const parseToken = await this.parse_token(token || "");
                if (!parseToken) {
                    return { ok: false, response: response_data(401, 401, "Unauthorized", []) };
                }
                token = parseToken.token;
            }
            const { body, form } = await this.get_body(req);
            const baseSchema = isZodObject(json_protector) ? json_protector : z.object(json_protector);
            const Schema = "hash_key" in baseSchema.shape
                ? baseSchema.strict()
                : baseSchema.extend({ hash_key: z.string() }).strict();

            const validation = Schema.safeParse(body);
            if (!validation.success) {
                return { ok: false, response: response_data(400, 400, validation.error.issues[0].message, []) };
            }
            const safeData = validation.data as Record<string, any>;
            if (this.hasDangerousKeys(safeData)) {
                return { ok: false, response: response_data(400, 400, "Invalid dangerous keys", []) };
            }

            if (!cryptoService.decrypt(safeData.hash_key)) {
                return { ok: false, response: response_data(400, 400, "Invalid hash key", []) };
            }
            const rl = await RateLimiter.check(safeData.hash_key, ratlimit, time_limit);
            if (!rl.allowed) {
                return { ok: false, response: response_data(429, 429, "Too many requests", []) };
            }
            return {
                ok: true,
                data: { ...safeData, ...(check_token && { token }) },
                form
            };
        } catch (err) {
            eLog("❌ Protect error:", err);
            return { ok: false, response: response_data(500, 500, "Server error", []) };
        }
    }

    public async protect_get(req: NextRequest): Promise<ProtectResult<{ token: string }>> {
        if (!check_header(req)) {
            return { ok: false, response: response_data(403, 403, "Forbidden", []) };
        }
        const token = this.extractToken(req);
        const parseToken = await this.parse_token(token || "");
        if (!parseToken) {
            return { ok: false, response: response_data(401, 401, "Unauthorized", []) };
        }

        const response = response_data(200, 200, "OK", { token: parseToken.token });
        // Set new token in response cookies if it was refreshed
        if (parseToken.token !== token) {
            response.cookies.set("access_token", parseToken.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                path: "/",
                sameSite: "strict",
                maxAge: this.expireAt(1),
            });
        }
        return { ok: true, data: { token: parseToken.token }, form: null };
    }
}