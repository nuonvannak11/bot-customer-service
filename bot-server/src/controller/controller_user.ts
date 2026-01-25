import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcryptjs";
import model_user from "../models/model_user";
import hashData from "../helper/hash_data";
import CheckJWT from "../helper/check_jwt";
import Platform from "../models/model_platform";
import { PHONE_REGEX, EMAIL_REGEX, GOOGLE_TOKEN_REGEX, EXPIRE_TOKEN_TIME } from "../constants";
import { get_env } from "../utils/get_env";
import { empty, random_number, expiresAt, eLog, generate_string, str_number, format_phone } from "../utils/util";
import { make_schema, RequestSchema } from "../helper";
import { check_header, response_data } from "../libs/lib";
import { ProtectController } from "./controller_protect";
import { SettingDoc, TokenData } from "../types/type";
import model_settings from "../models/model_settings";
import { ISetting } from "../interface/interface_setting";
import { IUser } from "../interface/interface_user";
import mongoose, { set } from "mongoose";
import controller_redis from "./controller_redis";
import model_scan_file, { IScanFile } from "../models/model_scan_file";

class UserController extends ProtectController {
    private build_key_scan_file(user_id: string) {
        return `scan_file_${user_id}`;
    }

    public async get_user_settings(user_id: string): Promise<{ chat_id: string; files: string[]; }[] | null> {
        if (!user_id) return null;
        let settings = await controller_redis.get<{
            chat_id: string;
            files: string[];
        }[]>(this.build_key_scan_file(user_id));

        if (!settings) {
            const user_settings = await model_scan_file.findOne({ user_id }).select("chats").exec();
            if (user_settings) {
                settings = user_settings.chats;
                await controller_redis.set(this.build_key_scan_file(user_id), settings);
            } else {
                settings = null;
            }
        }
        return settings;
    }
}

export default new UserController;