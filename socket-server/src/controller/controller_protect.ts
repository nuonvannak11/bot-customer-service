import { Request, Response } from "express";
import { z } from "zod";
import { eLog, empty } from "../utils/util";
import { cryptoService } from "../lib/crypto";

interface ValidationResult<T> {
    success: boolean;
    data?: T;
    error?: { code: number; message: string };
}

const RequestSchema = z.object({
    data: z.string().optional(),
});

interface ProcessOptions {
    requireAuth: boolean;
}

export class ProtectController {

    public decodeString(value: unknown, encrypted: boolean = false): string | null {
        if (typeof value !== 'string') return null;
        try {
            const raw = encrypted ? cryptoService.decrypt(value) : value;
            if (raw == null || empty(raw)) return null;
            return raw.trim();
        } catch (error) {
            eLog('Redis control decrypt string failed:', error);
            return null;
        }
    }

    public async protect_get<T extends object>(
        req: Request,
        res: Response,
        requireAuth: boolean = false
    ): Promise<T | false> {
        return this.processRequest<T>(req, res, { requireAuth });
    }

    public async protect_post<T extends object>(
        req: Request,
        res: Response,
        requireAuth: boolean = false
    ): Promise<T | false> {
        return this.processRequest<T>(req, res, { requireAuth });
    }

    private async processRequest<T extends object>(
        req: Request,
        res: Response,
        options: ProcessOptions
    ): Promise<T | false> {

        if (options.requireAuth) {
        }

        let finalData: Partial<T> = {};
        if (!empty(req.query)) {
            finalData = { ...finalData, ...req.query } as Partial<T>;
        }
        if (!empty(req.body)) {
            const bodyResult = this.parseAndValidateBody<T>(req);
            if (!bodyResult.success) {
                eLog("Body Validation Error:", bodyResult.error);
                return false;
            }

            finalData = { ...finalData, ...bodyResult.data };
        }
        return finalData as T;
    }

    private parseAndValidateBody<T>(req: Request): ValidationResult<T> {
        const parsed = RequestSchema.safeParse(req.body);
        if (!parsed.success) {
            return {
                success: false,
                error: { code: 400, message: "Invalid request structure" }
            };
        }
        return { success: true, data: req.body as T };
    }
}