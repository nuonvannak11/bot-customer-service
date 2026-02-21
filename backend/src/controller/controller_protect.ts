import { Request, Response } from "express";
import { response_data, check_header, ensureHashKey } from "../libs/lib";
import jwtService from "../libs/jwt";
import { cryptoService } from "../libs/crypto";
import { empty, str_lower } from "../utils/util";
import { AuthData, ValidationResult } from "../interface";
import { RequestSchema } from "../schema";

interface ProcessOptions {
    requireAuth: boolean;
    requireBody: boolean;
    requireQuery: boolean;
}

export class ProtectController {
    private hasDangerousKeys(obj: unknown): boolean {
        if (typeof obj !== "object" || obj === null) return false;
        for (const [key, value] of Object.entries(obj)) {
            if (key.startsWith("$") || key.includes(".")) return true;
            if (typeof value === "object" && value !== null && !Buffer.isBuffer(value)) {
                if (this.hasDangerousKeys(value)) return true;
            }
        }
        return false;
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
            const ensureToken = await this.extractToken(req);
            if (!ensureToken) {
                response_data(res, 401, "Unauthorized", []);
                return false;
            }
            authData = ensureToken;
        }

        const hasQuery = !empty(req.query);
        if (options.requireQuery || hasQuery) {
            if (options.requireQuery && !hasQuery) {
                response_data(res, 400, "Query parameters required", []);
                return false;
            }
            queryData = req.query as Partial<T>;
        }

        const isMultipart = req.is("multipart/form-data");
        const hasBody = !empty(req.body) || req.file || req.files;

        if (options.requireBody || hasBody) {
            if (options.requireBody && !hasBody) {
                response_data(res, 400, "Request body or file required", []);
                return false;
            }
            if (isMultipart) {
                bodyData = { ...req.body, file: req.file, files: req.files } as Partial<T>;
            } else {
                const bodyResult = this.parseAndValidateBody<T>(req);
                if (!bodyResult.success) {
                    response_data(res, bodyResult.error!.code, bodyResult.error!.message, []);
                    return false;
                }
                bodyData = bodyResult.data!;
            }
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
        const decrypted = cryptoService.decrypt(parsed.data.payload);
        if (!decrypted) return { success: false, error: { code: 400, message: "Invalid payload" } };

        let parsedData: T;
        try {
            parsedData = JSON.parse(decrypted) as T;
        } catch {
            return { success: false, error: { code: 400, message: "Invalid JSON format" } };
        }
        if (ensureHashKey(parsedData)) {
            if (!cryptoService.decrypt(parsedData.hash_key)) {
                return { success: false, error: { code: 400, message: "Invalid hash key" } };
            }
        }
        return { success: true, data: parsedData };
    }

    public async extractToken(req: Request): Promise<AuthData | null> {
        const header = req.headers.authorization || req.headers.Authorization;
        if (!header || typeof header !== "string") return null;
        const [scheme, token] = header.trim().split(/\s+/);
        if (str_lower(scheme) !== "bearer" || !token) return null;
        const verify = await jwtService.verifyToken(token);
        if (!verify) return null;
        const { user_id, session_id } = verify;
        return { user_id, session_id, token };
    }

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
}