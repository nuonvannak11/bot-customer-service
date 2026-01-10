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

    private hasDangerousKeys(obj: any): boolean {
        if (typeof obj !== "object" || obj === null) return false;
        for (const key in obj) {
            if (key.startsWith("$") || key.includes(".")) return true;
            const value = obj[key];
            if (typeof value === "object" && this.hasDangerousKeys(value)) return true;
        }
        return false;
    }

    async protect<T extends z.ZodRawShape>(req: NextRequest, json_protector: T, check_token?: boolean) {
        if (check_token) {
            const get_token = req.cookies.get("authToken")?.value;
            const verify = await checkJwtToken(get_token);
            if (!verify.status) {
                return response_data(401, 401, "Unauthorized", []);
            }
            this.token = get_token;
        }
        const Schema = z.object(json_protector).strict();
        const header = check_header(req);
        if (!header) return response_data(403, 403, "Forbidden", []);

        const body = await req.json();
        const validation = Schema.safeParse(body);

        if (!validation.success) {
            return response_data(400, 400, validation.error.issues[0].message, []);
        }

        if (this.hasDangerousKeys(validation.data)) {
            return response_data(400, 400, "Invalid dangerous keys", []);
        }

        const { hash_key } = validation.data as any;
        const decrypt_key = HashKey.decrypt(hash_key);

        if (empty(decrypt_key)) {
            return response_data(400, 400, "Invalid hash key", []);
        }

        const rl = await rate_limit(hash_key, 5, 120);
        if (!rl.allowed) {
            return response_data(429, 429, "Too many requests", []);
        }
        const base = validation.data as Record<string, any>;
        const collectin = check_token && this.token ? { ...base, token: this.token } : base;
        this.data = collectin;
        return true;
    }
}
