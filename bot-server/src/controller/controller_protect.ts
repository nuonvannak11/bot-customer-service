import { Request, Response } from "express";
import { fileTypeFromBuffer } from "file-type";
import { response_data, checkJwtToken } from "../libs/lib";
import hashData from "../helper/hash_data";
import { RequestSchema } from "../helper";

export class ProtectController {

    public async protect_buffer(buffer: Buffer, block = ["exe", "apk", "bat", "cmd"], is_magic = false) {
        if (!buffer || buffer.length === 0) {
            return { status: false, message: "Missing file data" };
        }
        if (is_magic) {
            const magic = buffer.toString("ascii", 0, 2);
            if (magic === "MZ") {
                return { status: true, message: "Executable disguised as safe file" };
            }
        }
        const detected = await fileTypeFromBuffer(buffer);
        if (!detected) {
            return { status: false, message: "Unknown or dangerous file" };
        }
        const { ext } = detected;
        if (block.includes(ext)) {
            return { status: true, message: `Blocked file type: ${ext}` };
        }
        return { status: false, message: "File safe", ext };
    }

    private hasDangerousKeys(obj: any): boolean {
        if (typeof obj !== "object" || obj === null) return false;
        for (const key in obj) {
            if (key.startsWith("$") || key.includes(".")) return true;
            const value = obj[key];
            if (typeof value === "object" && this.hasDangerousKeys(value)) return true;
        }
        return false;
    }

    private extractBearerToken(header: string | undefined) {
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

    async protect_post<T extends object>(req: Request, res: Response): Promise<T | false> {
        let data: any = {};
        const isToken = await this.extractToken(req);
        if (!isToken) {
            response_data(res, 401, "Unauthorized", []);
            return false;
        }

        data.user_id = isToken.user_id;
        data.session_id = isToken.session_id;
        data.token = isToken.token;

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
        const collection = { ...data, ...parse_data };
        if (this.hasDangerousKeys(collection)) {
            response_data(res, 400, "Invalid request", []);
            return false;
        }
        return collection;
    }

    async protect_get<T extends object>(req: Request, res: Response): Promise<T | false> {
        let data: any = {}
        const isToken = await this.extractToken(req);
        if (isToken === null) {
            response_data(res, 401, "Unauthorized", []);
            return false;
        }

        data.user_id = isToken.user_id;
        data.session_id = isToken.session_id;
        data.token = isToken.token;

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
        const collection = { ...data, ...parse_data };
        if (this.hasDangerousKeys(collection)) {
            response_data(res, 400, "Invalid request", []);
            return false;
        }
        return collection;
    }
}
