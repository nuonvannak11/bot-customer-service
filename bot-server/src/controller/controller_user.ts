import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcryptjs";
import AppUser from "../models/model_user";
import hashData from "../helper/hash_data";
import CheckJWT from "../helper/check_jwt";
import PhoneVerify from "../models/model_phone_verify";
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

class UserController extends ProtectController {
    private readonly phoneRegex = PHONE_REGEX;
    private readonly emailRegex = EMAIL_REGEX;

    private async active_token(user_id: string, token: string) {
        if (!token || !user_id) return false;
        const check_user = await AppUser.findOne({ user_id }).select("+access_token_hash").lean();
        if (!check_user) return false;
        if (token !== check_user.access_token_hash) return false;
        return true;
    }
}

export default new UserController;