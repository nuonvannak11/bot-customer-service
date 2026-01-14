import { Request, Response } from "express";
import { response_data, check_header, checkJwtToken } from "../libs/lib";
import HashKey from "../helper/hash_key";
import hashData from "../helper/hash_data";
import { RequestSchema } from "../helper";
import { empty } from "../utils/util";
// import { rate_limit } from "../helper/ratelimit";

export class ProtectController {
    private hasDangerousKeys(obj: any): boolean {
        if (typeof obj !== "object" || obj === null) return false;
        for (const key in obj) {
            if (key.startsWith("$") || key.includes(".")) return true;
            const value = obj[key];
            if (typeof value === "object" && this.hasDangerousKeys(value)) return true;
        }
        return false;
    }

    public extractBearerToken(header: string | undefined) {
        if (!header || typeof header !== "string") return null;
        const [scheme, token] = header.trim().split(/\s+/);
        if (scheme?.toLowerCase() !== "bearer" || !token) return null;
        return token;
    }

    public async extractToken(req: Request): Promise<{ user_id: string; session_id: string, token: string } | null> {
        const header = req.headers.authorization;
        if (!header || typeof header !== "string") {
            return null;
        }
        const token = this.extractBearerToken(header);
        if (!token) {
            return null;
        }
        const verify = await checkJwtToken(token);

        if (!verify.status || !verify.data) {
            return null;
        }

        return {
            user_id: verify.data.user_id,
            session_id: verify.data.session_id,
            token
        };
    }

    async protect_post<T extends object>(req: Request, res: Response, check_token?: boolean): Promise<T | false> {
        let data: any = {};
        const header = check_header(req);
        if (!header) {
            response_data(res, 403, "Forbidden", []);
            return false;
        }
        if (check_token) {
            const isToken = await this.extractToken(req);
            if (!isToken) {
                response_data(res, 401, "Unauthorized", []);
                return false;
            }
            data.user_id = isToken.user_id;
            data.session_id = isToken.session_id;
            data.token = isToken.token;
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

        return { ...data, ...parse_data };
    }

    async protect_get<T extends object>(req: Request, res: Response): Promise<T | false> {
        let data: any = {}
        const header = check_header(req);
        if (!header) {
            response_data(res, 403, "Forbidden", []);
            return false;
        }
        const isToken = await this.extractToken(req);
        if (!isToken) {
            response_data(res, 401, "Unauthorized", []);
            return false;
        }
        data.user_id = isToken.user_id;
        data.session_id = isToken.session_id;
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
                ...data,
                ...parse_data
            };
        } else {
            return data;
        }
    }
}
