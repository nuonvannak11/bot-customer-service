import { NextRequest } from "next/server";
import { z } from "zod";
import { eLog, response_data } from "@/libs/lib";
import { check_header } from "@/libs/lib";
import HashKey from "@/helper/hash_key";
import { empty } from "@/utils/util";
import { rate_limit } from "@/helper/ratelimit";
import { checkJwtToken } from "@/hooks/use_check_jwt";
import { fileTypeFromBuffer } from "file-type";
import { ProtectFileOptions } from "@/interface";

export class ProtectController {
    protected data: any = {};
    private readonly default_extensions_img = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp", "image/tiff", "image/svg+xml"];
    private readonly dangerousKeys = new Set([
        "__proto__",
        "constructor",
        "prototype",
        "$gt", "$gte", "$lt", "$lte", "$ne", "$in", "$nin",
        "$regex", "$where", "$expr", "$function", "$accumulator",
        "$merge", "$out", "$project", "$lookup", "$group",
        "$set", "$unset", "$push", "$pop"
    ]);

    private async get_body(req: NextRequest) {
        try {
            const contentType = req.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
                return { body: await req.json(), form: null };
            }
            if (contentType.includes("multipart/form-data")) {
                const form = await req.formData();
                const output: Record<string, any> = {};
                for (const [key, value] of form.entries()) {
                    if (value instanceof File) continue;
                    output[key] = value?.toString() ?? "";
                }
                return { body: output, form };
            }
            if (contentType.includes("application/x-www-form-urlencoded")) {
                const text = await req.text();
                return {
                    body: Object.fromEntries(new URLSearchParams(text)),
                    form: null
                };
            }
            return { body: {}, form: null };
        } catch (err) {
            eLog("getSafeBody error:", err);
            return { body: {}, form: null };
        }
    }

    public async protect_file({ form, field, maxSizeMB = 5, allowed = this.default_extensions_img, }: ProtectFileOptions) {
        if (!form) {
            return { ok: false, error: "Missing form data" };
        }
        const file = form.get(field);
        if (!file) {
            return { ok: false, error: `Missing file field: ${field}` };
        }
        if (!(file instanceof File)) {
            return { ok: false, error: `Field ${field} is not a valid File` };
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
            return { ok: false, error: `File ${field} exceeds ${maxSizeMB}MB limit` };
        }
        if (!allowed.includes(file.type)) {
            return { ok: false, error: `File ${field} type not allowed: ${file.type}` };
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        const detected = await fileTypeFromBuffer(buffer);
        if (file.type === "image/svg+xml") {
            return { ok: true, file, buffer, ext: "svg", mime: "image/svg+xml" };
        }
        if (!detected || !allowed.includes(detected.mime)) {
            return { ok: false, error: `File content mismatch for field ${field}` };
        }
        return { ok: true, file, buffer, ext: detected.ext, mime: detected.mime };
    }

    public hasDangerousKeys(obj: any): boolean {
        if (obj === null || typeof obj !== "object") return false;
        if (Array.isArray(obj)) {
            return obj.some((item) => this.hasDangerousKeys(item));
        }
        for (const key in obj) {
            const value = obj[key];
            if (this.dangerousKeys.has(key)) return true;
            if (key.startsWith("$")) return true;
            if (key.includes(".")) return true;
            if (typeof value === "object" && this.hasDangerousKeys(value)) {
                return true;
            }
        }
        return false;
    }

    public async extractToken(req: NextRequest): Promise<string | null> {
        const token = req.cookies.get("authToken")?.value ?? null;
        if (!token) return null;
        const verify = await checkJwtToken(token);
        if (!verify.status) {
            return null;
        }
        return token;
    }

    public async parse_token(token?: string) {
        if (empty(token)) return null;
        const parse_data = await checkJwtToken(token);
        if (!parse_data.status) return null;
        return parse_data.data;
    }

    async protect<T extends z.ZodRawShape>(req: NextRequest, json_protector: T, ratlimit = 5, check_token = false, time_limit = 120) {
        try {
            if (check_token) {
                const token = req.cookies.get("authToken")?.value;
                const verify = await checkJwtToken(token);
                if (!verify.status) {
                    return { ok: false, response: response_data(401, 401, "Unauthorized", []) };
                }
            }
            if (!check_header(req)) {
                return { ok: false, response: response_data(403, 403, "Forbidden", []) };
            }
            const { body, form } = await this.get_body(req);
            const BaseSchema = z.object({ hash_key: z.string() });
            const Schema = BaseSchema.extend(json_protector).strict();
            const validation = Schema.safeParse(body);
            if (!validation.success) {
                return { ok: false, response: response_data(400, 400, validation.error.issues[0].message, []) };
            }
            type SafeData = z.infer<z.ZodObject<T>> & { hash_key: string };
            const safeData = validation.data as SafeData;
            if (this.hasDangerousKeys(safeData)) {
                return { ok: false, response: response_data(400, 400, "Invalid dangerous keys", []) };
            }
            const hash_key = safeData.hash_key;
            const decryptKey = HashKey.decrypt(hash_key);

            if (!decryptKey) {
                return { ok: false, response: response_data(400, 400, "Invalid hash key", []) };
            }
            const rl = await rate_limit(hash_key, ratlimit, time_limit);
            if (!rl.allowed) {
                return { ok: false, response: response_data(429, 429, "Too many requests", []) };
            }
            const data = {
                ...safeData,
                ...(check_token ? { token: req.cookies.get("authToken")?.value } : {})
            };
            return { ok: true, data, form };
        } catch (err) {
            eLog("Protect error:", err);
            return { ok: false, response: response_data(500, 500, "Server error", []) };
        }
    }

    async protect_get(req: NextRequest): Promise<string | false> {
        const header = check_header(req);
        if (!header) {
            response_data(403, 403, "Forbidden", []);
            return false;
        }
        const get_token = await this.extractToken(req);
        if (!get_token) {
            response_data(401, 401, "Unauthorized", []);
            return false;
        }
        return get_token;
    }
}
