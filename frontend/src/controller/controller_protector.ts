import { NextRequest } from "next/server";
import { z } from "zod";
import { eLog, response_data } from "@/libs/lib";
import { check_header } from "@/libs/lib";
import jwtService from "@/libs/jwt";
import cryptoService from "@/libs/crypto";
import { rate_limit } from "@/helper/ratelimit";
import { fileTypeFromBuffer } from "file-type";
import { ParseJWTPayload, ProtectFileOptions } from "@/interface";

type ProtectSuccess<TData> = {
    ok: true;
    data: TData;
    form: FormData | null;
};

type ProtectFailure = {
    ok: false;
    response: ReturnType<typeof response_data>;
};

type ProtectResult<TData> = ProtectSuccess<TData> | ProtectFailure;

type ShapeRecord = Record<string, z.ZodType>;

type ShapeOutput<T extends ShapeRecord> = {
    [K in keyof T]: z.output<T[K]>;
};

type ProtectData<T extends ShapeRecord> = ShapeOutput<T> & {
    hash_key: string;
    token?: string;
};

type ProtectDataSchema<TSchema extends z.ZodObject<z.ZodRawShape>> = z.output<TSchema> & {
    hash_key: string;
    token?: string;
};

type ProtectDataFor<T> = T extends z.ZodObject<z.ZodRawShape>
    ? ProtectDataSchema<T>
    : T extends ShapeRecord
    ? ProtectData<T>
    : never;

type ProtectDataWithToken<T> = ProtectDataFor<T> & {
    token: string;
};

const isZodObject = (value: unknown): value is z.ZodObject<z.ZodRawShape> => {
    return typeof value === "object"
        && value !== null
        && "shape" in value
        && typeof (value as z.ZodObject<z.ZodRawShape>).safeParse === "function";
};

export class ProtectController {
    protected data: Record<string, unknown> = {};
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
                const output: Record<string, unknown> = {};
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

    public hasDangerousKeys(obj: unknown): boolean {
        if (obj === null || typeof obj !== "object") return false;
        if (Array.isArray(obj)) {
            return obj.some((item) => this.hasDangerousKeys(item));
        }
        for (const key in obj) {
            const value = (obj as Record<string, unknown>)[key];
            if (this.dangerousKeys.has(key)) return true;
            if (key.startsWith("$")) return true;
            if (key.includes(".")) return true;
            if (typeof value === "object" && this.hasDangerousKeys(value)) {
                return true;
            }
        }
        return false;
    }

    public extractToken(req: NextRequest): string | null {
        const token = req.cookies.get("authToken")?.value ?? null;
        if (!token) return null;
        return token;
    }

    public parse_token(token: string): ParseJWTPayload | null {
        if (!token) return null;
        const ensureToken = jwtService.verifyToken<ParseJWTPayload>(token);
        if (!ensureToken) return null;
        return ensureToken as ParseJWTPayload;
    }

    async protect<T extends ShapeRecord | z.ZodObject<z.ZodRawShape>>(req: NextRequest, json_protector: T, ratlimit?: number, check_token?: false, time_limit?: number): Promise<ProtectResult<ProtectDataFor<T>>>;
    async protect<T extends ShapeRecord | z.ZodObject<z.ZodRawShape>>(req: NextRequest, json_protector: T, ratlimit: number, check_token: true, time_limit?: number): Promise<ProtectResult<ProtectDataWithToken<T>>>;
    async protect<T extends ShapeRecord | z.ZodObject<z.ZodRawShape>>(req: NextRequest, json_protector: T, ratlimit = 5, check_token = false, time_limit = 120): Promise<ProtectResult<ProtectDataFor<T> | ProtectDataWithToken<T>>> {
        try {
            const token = this.extractToken(req);
            if (check_token) {
                if (!token) {
                    return { ok: false, response: response_data(401, 401, "Unauthorized", []) };
                }
                const ensureToken = this.parse_token(token);
                if (!ensureToken) {
                    return { ok: false, response: response_data(401, 401, "Unauthorized", []) };
                }
            }
            if (!check_header(req)) {
                return { ok: false, response: response_data(403, 403, "Forbidden", []) };
            }
            const { body, form } = await this.get_body(req);
            const Schema = isZodObject(json_protector)
                ? ("hash_key" in json_protector.shape
                    ? json_protector.strict()
                    : json_protector.extend({ hash_key: z.string() }).strict())
                : z.object({ hash_key: z.string(), ...json_protector }).strict();
            const validation = Schema.safeParse(body);
            if (!validation.success) {
                return { ok: false, response: response_data(400, 400, validation.error.issues[0].message, []) };
            }
            const safeData = validation.data as unknown as ProtectDataFor<T>;
            if (this.hasDangerousKeys(safeData)) {
                return { ok: false, response: response_data(400, 400, "Invalid dangerous keys", []) };
            }
            const hash_key = safeData.hash_key;
            const ensureKey = cryptoService.decrypt(hash_key);
            if (!ensureKey) {
                return { ok: false, response: response_data(400, 400, "Invalid hash key", []) };
            }
            const rl = await rate_limit(hash_key, ratlimit, time_limit);
            if (!rl.allowed) {
                return { ok: false, response: response_data(429, 429, "Too many requests", []) };
            }
            const data = {
                ...safeData,
                ...(check_token ? { token } : {})
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
