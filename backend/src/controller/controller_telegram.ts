import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import AppUser from "../models/model_user";
import hashData from "../helper/hash_data";
import CheckJWT from "../helper/check_jwt";
import Platform from "../models/model_platform";
import { PHONE_REGEX, EMAIL_REGEX, GOOGLE_TOKEN_REGEX, EXPIRE_TOKEN_TIME } from "../constants";
import { get_env } from "../utils/get_env";
import { empty, random_number, expiresAt, eLog, generate_string } from "../utils/util";
import { get_session_id } from "../helper/random";

class TelegramController {
    private readonly phoneRegex = PHONE_REGEX;
    private readonly emailRegex = EMAIL_REGEX;

    public async save(req: Request, res: Response) {
        const encryptedBody = req.body.payload;
        if (typeof encryptedBody !== 'string' || encryptedBody.length === 0) {
            return res.status(200).json({
                code: 400,
                success: false,
                message: "Invalid request body."
            });
        }
        const decryptedData = hashData.decryptData(encryptedBody);
        if (!decryptedData) {
            return res.status(200).json({
                code: 400,
                success: false,
                message: "Failed to decrypt data."
            });
        }

        try {
            const jsonData = JSON.parse(typeof decryptedData === 'string' ? decryptedData.trim() : decryptedData as any);
            return res.status(200).json({
                code: 200,
                success: true,
                message: "Settings saved successfully.",
                data: jsonData
            });
        } catch (error) {
            return res.status(200).json({
                code: 400,
                success: false,
                message: "Invalid data format: decrypted content was not valid JSON.",
                decryptedContent: decryptedData
            });
        }
    }
}

export default new TelegramController;