import { Request, Response } from "express";
import { response_data, check_header, checkJwtToken, ensureHashKey } from "../libs/lib";
import HashKey from "../helper/hash_key";
import hashData from "../helper/hash_data";
import { RequestSchema } from "../helper";
import { empty } from "../utils/util";
import { AuthData, ValidationResult } from "../interface";

interface ProcessOptions {
    requireAuth: boolean;
    requireBody: boolean;
    requireQuery: boolean;
}

export class ProtectController {
    public async protect_get<T extends object>(
        req: Request,
        res: Response,
        requireQuery: boolean = false,
        requireAuth: boolean = true
    ): Promise<T | false> {
        return this.processRequest<T>(req, res, { requireAuth, requireBody: false, requireQuery });
    }

    public async protect_post<T extends object>(
        req: Request,
        res: Response,
        check_token: boolean = false
    ): Promise<T | false> {
        return this.processRequest<T>(req, res, { requireAuth: check_token, requireBody: true, requireQuery: false });
    }

    private async processRequest<T extends object>(
        req: Request,
        res: Response,
        options: ProcessOptions
    ): Promise<T | false> {
        if (!check_header(req)) {
            response_data(res, 403, "Forbidden", []);
            return false;
        }

        let authData: Partial<AuthData> = {};
        let bodyData: Partial<T> = {};
        let queryData: Partial<T> = {};

        if (options.requireAuth) {
            const token = await this.extractToken(req);
            if (!token) {
                response_data(res, 401, "Unauthorized", []);
                return false;
            }
            authData = token;
        }
        const hasQuery = !empty(req.query);
        if (options.requireQuery || hasQuery) {
            if (options.requireQuery && !hasQuery) {
                response_data(res, 400, "Query parameters required", []);
                return false;
            }
            queryData = req.query as Partial<T>;
        }

        const hasBody = !empty(req.body);
        if (options.requireBody || hasBody) {
            if (options.requireBody && !hasBody) {
                response_data(res, 400, "Request body required", []);
                return false;
            }
            const bodyResult = this.parseAndValidateBody<T>(req);
            if (!bodyResult.success) {
                response_data(res, bodyResult.error!.code, bodyResult.error!.message, []);
                return false;
            }
            bodyData = bodyResult.data!;
        }
        const finalData = { ...authData, ...queryData, ...bodyData };
        if (this.hasDangerousKeys(finalData)) {
            response_data(res, 400, "Invalid request payload", []);
            return false;
        }
        return finalData as T;
    }

    private parseAndValidateBody<T extends object>(req: Request): ValidationResult<T> {
        const parsed = RequestSchema.safeParse(req.body);
        if (!parsed.success) return { success: false, error: { code: 400, message: "Invalid request" } };

        const decrypted = hashData.decryptData(parsed.data.payload);
        if (!decrypted) return { success: false, error: { code: 400, message: "Invalid payload" } };

        let parsedData: T;
        try {
            parsedData = JSON.parse(decrypted) as T;
        } catch {
            return { success: false, error: { code: 400, message: "Invalid JSON format" } };
        }

        if (ensureHashKey(parsedData)) {
            if (!HashKey.decrypt(parsedData.hash_key)) {
                return { success: false, error: { code: 400, message: "Invalid hash key" } };
            }
        }

        return { success: true, data: parsedData };
    }

    public async extractToken(req: Request): Promise<AuthData | null> {
        const header = req.headers.authorization;
        if (!header || typeof header !== "string") return null;
        const [scheme, token] = header.trim().split(/\s+/);
        if (scheme?.toLowerCase() !== "bearer" || !token) return null;

        const verify = await checkJwtToken(token);
        if (!verify?.status || !verify?.data) return null;
        return {
            user_id: verify.data.user_id,
            session_id: verify.data.session_id,
            token
        };
    }

    private hasDangerousKeys(obj: unknown): boolean {
        if (typeof obj !== "object" || obj === null) return false;
        for (const [key, value] of Object.entries(obj)) {
            if (key.startsWith("$") || key.includes(".")) return true;
            if (typeof value === "object" && value !== null) {
                if (this.hasDangerousKeys(value)) return true;
            }
        }
        return false;
    }
}