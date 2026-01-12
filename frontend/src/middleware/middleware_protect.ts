import { NextRequest } from "next/server";
import { z } from "zod";
import { response_data } from "@/libs/lib";
import { check_header } from "@/libs/lib";
import HashKey from "@/helper/hash_key";
import { empty } from "@/utils/util";
import { rate_limit } from "@/helper/ratelimit";
import { checkJwtToken } from "@/hooks/use_check_jwt";

export class ProtectMiddleware {

    protected data: any = {};
    private token: any = "";

    private readonly dangerousKeys = new Set([
        "__proto__",
        "constructor",
        "prototype",
        "$gt", "$gte", "$lt", "$lte", "$ne", "$in", "$nin",
        "$regex", "$where", "$expr", "$function", "$accumulator",
        "$merge", "$out", "$project", "$lookup", "$group",
        "$set", "$unset", "$push", "$pop"
    ]);

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

    async protect<T extends z.ZodRawShape>(req: NextRequest, json_protector: T, check_token?: boolean) {
        if (check_token) {
            const get_token = req.cookies.get("authToken")?.value;
            const verify = await checkJwtToken(get_token);
            if (!verify.status) {
                response_data(401, 401, "Unauthorized", []);
                return false;
            }
            this.token = get_token;
        }
        const Schema = z.object(json_protector).strict();
        const header = check_header(req);
        if (!header) {
            response_data(403, 403, "Forbidden", []);
            return false;
        }

        const body = await req.json();
        const validation = Schema.safeParse(body);

        if (!validation.success) {
            response_data(400, 400, validation.error.issues[0].message, []);
            return false;
        }

        if (this.hasDangerousKeys(validation.data)) {
            response_data(400, 400, "Invalid dangerous keys", []);
            return false;
        }

        const { hash_key } = validation.data as any;
        const decrypt_key = HashKey.decrypt(hash_key);

        if (empty(decrypt_key)) {
            response_data(400, 400, "Invalid hash key", []);
            return false;
        }
        const rl = await rate_limit(hash_key, 5, 120);
        if (!rl.allowed) {
            response_data(429, 429, "Too many requests", []);
            return false;
        }
        const base = validation.data as Record<string, any>;
        const collectin = check_token && this.token ? { ...base, token: this.token } : base;
        this.data = collectin;
        return true;
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
