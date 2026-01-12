import { Request, Response } from "express";
import { response_data, check_header, checkJwtToken } from "../libs/lib";
import HashKey from "../helper/hash_key";
import hashData from "../helper/hash_data";
import { RequestSchema } from "../helper";
import { empty } from "../utils/util";
// import { rate_limit } from "../helper/ratelimit";

export class ProtectController {
    protected data_post: any = {};

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

    async protect_post<T extends object>(req: Request, res: Response, check_token?: boolean): Promise<T | false> {
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
                this.data_post.user_id = verify.data.user_id;
                this.data_post.session_id = verify.data.session_id;
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

        const decrypted = hashData.decryptData(parsed.data.payload);
        if (!decrypted) {
            response_data(res, 400, "Invalid payload", []);
            return false;
        }

        let parse_data: T;

        try {
            parse_data = JSON.parse(decrypted) as T;
        } catch {
            response_data(res, 400, "Invalid JSON format", []);
            return false;
        }

        if ("hash_key" in parse_data) {
            const check_key = HashKey.decrypt((parse_data as any).hash_key);
            if (!check_key) {
                response_data(res, 400, "Invalid hash key", []);
                return false;
            }
        }

        this.data_post = {
            ...this.data_post,
            ...parse_data
        };

        return parse_data;
    }

    async protect_get<T extends object>(req: Request, res: Response): Promise<T | false> {
        const header = check_header(req);
        if (!header) {
            response_data(res, 403, "Forbidden", []);
            return false;
        }

        let data_get: any = {}
        const get_token = this.extractBearerToken(req.headers.authorization);
        if (!get_token) {
            response_data(res, 401, "Unauthorized", []);
            return false;
        }
        const verify = await checkJwtToken(get_token);
        if (!verify.status) {
            response_data(res, 401, "Unauthorized", []);
            return false;
        }
        if (verify.data) {
            data_get.user_id = verify.data.user_id;
            data_get.session_id = verify.data.session_id;
        }
        if (!empty(req.body)) {
            const parsed = RequestSchema.safeParse(req.body);
            if (!parsed.success) {
                response_data(res, 400, "Invalid request", []);
                return false;
            }

            const decrypted = hashData.decryptData(parsed.data.payload);
            if (!decrypted) {
                response_data(res, 400, "Invalid payload", []);
                return false;
            }
            let parse_data: T;
            try {
                parse_data = JSON.parse(decrypted) as T;
            } catch {
                response_data(res, 400, "Invalid JSON format", []);
                return false;
            }

            if ("hash_key" in parse_data) {
                const check_key = HashKey.decrypt((parse_data as any).hash_key);
                if (!check_key) {
                    response_data(res, 400, "Invalid hash key", []);
                    return false;
                }
            }
            return {
                ...data_get,
                ...parse_data
            };
        } else {
            return data_get;
        }
    }
}
