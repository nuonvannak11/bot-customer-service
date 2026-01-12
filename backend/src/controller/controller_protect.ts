import { Request, Response } from "express";
import { response_data, check_header, checkJwtToken } from "../libs/lib";
import HashKey from "../helper/hash_key";
import hashData from "../helper/hash_data";
import { make_schema, RequestSchema } from "../helper";
// import { rate_limit } from "../helper/ratelimit";

export class ProtectController {
    protected data: any = {};
    
    private hasDangerousKeys(obj: any): boolean {
        if (typeof obj !== "object" || obj === null) return false;
        for (const key in obj) {
            if (key.startsWith("$") || key.includes(".")) return true;
            const value = obj[key];
            if (typeof value === "object" && this.hasDangerousKeys(value)) return true;
        }
        return false;
    }

    extractBearerToken(header: string | undefined) {
        if (!header || typeof header !== "string") return null;
        const [scheme, token] = header.trim().split(/\s+/);
        if (scheme?.toLowerCase() !== "bearer" || !token) return null;
        return token;
    }

    async protect(req: Request, res: Response, check_token?: boolean): Promise<boolean> {
        if (check_token) {
            const get_token = this.extractBearerToken(req.headers.authorization);
            if (!get_token) {
                response_data(res, 401, "Invalid or missing token", []);
                return false;
            }
            const verify = await checkJwtToken(get_token);
            if (!verify.status) {
                response_data(res, 401, "Unauthorized", []);
                return false;
            }
            if (verify.data) {
                this.data.user_id = verify.data.user_id;
                this.data.session_id = verify.data.session_id;
            }
        }
        const header = check_header(req);
        if (!header) {
            response_data(res, 403, "Forbidden", []);
            return false;
        }

        const parsed = RequestSchema.safeParse(req.body);
        if (!parsed.success) {
            response_data(res, 400, "Invalid request", []);
            return false;
        }
        const decrypt_data = hashData.decryptData(parsed.data.payload);
        if (!decrypt_data) {
            response_data(res, 400, "Invalid payload", []);
            return false;
        }

        let parse_data: any;
        try {
            parse_data = JSON.parse(decrypt_data);
        } catch {
            response_data(res, 400, "Invalid data format: decrypted content was not valid JSON.", []);
            return false;
        }
        const { hash_key } = parse_data;
        const check_key = HashKey.decrypt(hash_key);
        if (!check_key) {
            response_data(res, 400, "Invalid hash key", []);
            return false;
        }
        const base = make_schema(parse_data as Record<string, any>).omit(["hash_key"]).get();
        this.data = {
            ...this.data,
            ...base
        };
        return true;
    }
}
