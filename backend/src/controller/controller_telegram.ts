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
import { ProtectController } from "./controller_protect";
import { ca } from "zod/locales";
import { response_data } from "../libs/lib";
import mongoose from "mongoose";

class TelegramController extends ProtectController {
    private readonly phoneRegex = PHONE_REGEX;
    private readonly emailRegex = EMAIL_REGEX;

    public async save(req: Request, res: Response) {
        const result = await this.protect(req, res, true);
        if (!result) return;
        try {
            const user_id = this.data.user_id;
            const bot_token_enc = this.data.botToken;

            if (!user_id || !bot_token_enc) {
                response_data(res, 400, "Invalid data request", []);
                return;
            }
            const check_user = await AppUser.findOne({ user_id });
            if (!check_user) {
                response_data(res, 400, "Invalid user", []);
                return;
            }

            const session = await mongoose.startSession();
            session.startTransaction();
            const update_platform = await Platform.findOneAndUpdate(
                { user_id },
                {
                    $set: {
                        "telegram.bot": [
                            {
                                bot_token_enc,
                            }
                        ]
                    },
                },
                { upsert: true, new: true, session }
            );

            if (!update_platform) {
                await session.abortTransaction();
                session.endSession();
                response_data(res, 500, "Failed to update platform", []);
                return;
            } else {
                await session.commitTransaction();
                session.endSession();
                response_data(res, 200, "Success", []);
                return;
            }

        } catch (err) {
            response_data(res, 500, "Internal server error", []);
            eLog(err);
            return;
        }
    }
}

export default new TelegramController;
