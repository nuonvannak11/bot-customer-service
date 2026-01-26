import { Request, Response } from "express";
import { response_data, check_header, checkJwtToken } from "../libs/lib";
import HashKey from "../helper/hash_key";
import hashData from "../helper/hash_data";
import { RequestSchema } from "../helper";
import { empty } from "../utils/util";
import { AuthData, ValidationResult } from "../interface";

export class ProtectController {
    public async protect_get<T extends object>(req: Request, res: Response): Promise<T | false> {
        return this.processRequest<T>(req, res, { requireAuth: true, requireBody: false });
    }

    public async protect_post<T extends object>(
        req: Request,
        res: Response,
        check_token: boolean = false
    ): Promise<T | false> {
        return this.processRequest<T>(req, res, { requireAuth: check_token, requireBody: true });
    }

    private async processRequest<T extends object>(
        req: Request,
        res: Response,
        options: { requireAuth: boolean; requireBody: boolean }
    ): Promise<T | false> {
        const headerResult = this.validateHeader(req);
        if (!headerResult.success) {
            response_data(res, headerResult.error!.code, headerResult.error!.message, []);
            return false;
        }

        let authData: Partial<AuthData> = {};
        if (options.requireAuth) {
            const authResult = await this.validateAuth(req);
            if (!authResult.success) {
                response_data(res, authResult.error!.code, authResult.error!.message, []);
                return false;
            }
            authData = authResult.data!;
        }

        const shouldParseBody = options.requireBody || !empty(req.body);
        let bodyData: Partial<T> = {};

        if (shouldParseBody) {
            if (options.requireBody && empty(req.body)) {
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

        const finalData = { ...authData, ...bodyData };
        if (this.hasDangerousKeys(finalData)) {
            response_data(res, 400, "Invalid request", []);
            return false;
        }

        return finalData as T;
    }

    private validateHeader(req: Request): ValidationResult<void> {
        if (!check_header(req)) {
            return { success: false, error: { code: 403, message: "Forbidden" } };
        }
        return { success: true };
    }

    private async validateAuth(req: Request): Promise<ValidationResult<AuthData>> {
        const token = await this.extractToken(req);
        if (!token) {
            return { success: false, error: { code: 401, message: "Unauthorized" } };
        }
        return { success: true, data: token };
    }

    private parseAndValidateBody<T extends object>(req: Request): ValidationResult<T> {
        const parsed = RequestSchema.safeParse(req.body);
        if (!parsed.success) {
            return { success: false, error: { code: 400, message: "Invalid request" } };
        }

        const decrypted = hashData.decryptData(parsed.data.payload);
        if (!decrypted) {
            return { success: false, error: { code: 400, message: "Invalid payload" } };
        }

        let parsedData: T;
        try {
            parsedData = JSON.parse(decrypted) as T;
        } catch {
            return { success: false, error: { code: 400, message: "Invalid JSON format" } };
        }

        if ("hash_key" in parsedData) {
            const isValidKey = HashKey.decrypt((parsedData as any).hash_key);
            if (!isValidKey) {
                return { success: false, error: { code: 400, message: "Invalid hash key" } };
            }
        }

        return { success: true, data: parsedData };
    }

    public extractBearerToken(header: string | undefined): string | null {
        if (!header || typeof header !== "string") return null;
        const [scheme, token] = header.trim().split(/\s+/);
        if (scheme?.toLowerCase() !== "bearer" || !token) return null;
        return token;
    }

    public async extractToken(req: Request): Promise<AuthData | null> {
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

    private hasDangerousKeys(obj: any): boolean {
        if (typeof obj !== "object" || obj === null) return false;
        for (const key in obj) {
            if (key.startsWith("$") || key.includes(".")) return true;

            const value = obj[key];
            if (typeof value === "object" && this.hasDangerousKeys(value)) {
                return true;
            }
        }
        return false;
    }
}