import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import AppUser from "../models/model_user";
import PhoneVerify from "../models/model_phone_verify";
import model_settings from "../models/model_settings";
import send_sms from "../services/send_sms";
import jwtService from "../libs/jwt";
import cryptoService from "../libs/crypto";
import { eLog } from "../libs/lib";
import { PHONE_REGEX, EMAIL_REGEX, GOOGLE_TOKEN_REGEX } from "../constants";
import { get_env } from "../utils/get_env";
import { empty, random_number, expiresAt, str_number, format_phone, str_val } from "../utils/util";
import { make_schema } from "../helper";
import { response_data } from "../libs/lib";
import { ProtectController } from "./controller_protect";
import { TokenData } from "../types/type";
import {
    GoogleLoginRequest,
    LoginRequest,
    RegisterRequest,
    ResendCodeRequest,
    VerifyPhoneRequest
} from "../interface/interface_user";
import { SaveUserProfile } from "../interface";
import { nextId } from "../libs/generateSnowflakeId";
import { getErrorMessage } from "../helper/errorHandling";


const GOOGLE_CLIENT_ID = get_env("GOOGLE_CLIENT_ID");
const googleOAuthClient = new OAuth2Client(GOOGLE_CLIENT_ID);

class UserController extends ProtectController {
    private readonly phoneRegex = PHONE_REGEX;

    private async ensureRefreshToken(user_id: string, refresh_token: string): Promise<boolean> {
        if (!user_id || !refresh_token) return false;
        const checkAccessToken = await AppUser.findOne({ user_id, refresh_token_hash: refresh_token }).lean();
        if (!checkAccessToken) return false;
        return true;
    }

    public async checkAccessToken(req: Request, res: Response): Promise<Response | void> {
        try {
            const results = await this.protect_get<TokenData>(req, res);
            if (!results) return;
            const { user_id } = results;
            const user = await AppUser.findOne({ user_id }).lean();
            if (!user) {
                response_data(res, 401, "Unauthorized", []);
                return;
            }
            const settings = await model_settings.findOne({ user_id }).lean();
            const { emailNotifications, twoFactor } = settings?.user || { emailNotifications: false, twoFactor: false };
            const { email, phone, name, avatar, bio, point } = user;
            const collection = { avatar, fullName: name, username: name, email, phone, bio, points: point, emailNotifications, twoFactor };
            return response_data(res, 200, "Success", cryptoService.encryptObject(collection));
        } catch (error) {
            eLog("Check auth error:", error);
            response_data(res, 500, "Internal server error", []);
        }
    }

    public async checkRefreshToken(req: Request, res: Response): Promise<Response | void> {
        try {
            const result = await this.protect_get<TokenData>(req, res);
            if (!result) return;
            const { user_id, token, session_id } = result;
            const check_token = await this.ensureRefreshToken(user_id, token);
            if (!check_token) {
                response_data(res, 401, "Unauthorized", []);
                return;
            }
            const accessToken = jwtService.signAccessToken({ user_id, session_id });
            return response_data(res, 200, "Success", accessToken);
        } catch (error) {
            eLog("Refresh token error:", error);
            return response_data(res, 500, "Internal server error", []);
        }
    }

    public async login(req: Request, res: Response): Promise<void> {
        try {
            const results = await this.protect_post<LoginRequest>(req, res);
            if (!results) return;

            const { phone, password } = results;
            if (empty(phone)) {
                response_data(res, 400, "Phone is required", []);
                return;
            }
            if (this.phoneRegex && !this.phoneRegex.test(phone)) {
                response_data(res, 400, "Invalid phone number format", []);
                return;
            }
            if (empty(password)) {
                response_data(res, 400, "Password is required", []);
                return;
            }
            const formatPhone = format_phone(phone);
            const phone_hash = cryptoService.hash(formatPhone);
            if (!phone_hash) {
                response_data(res, 400, "Invalid phone number format", []);
                return;
            }
            const ensureUser = await AppUser.findOne({ phone_hash }).select("+password +refresh_token_hash");
            if (!ensureUser) {
                response_data(res, 401, "Invalid phone number or password", []);
                return;
            }
            if (!ensureUser.phone_verified) {
                response_data(res, 403, "Please verify your phone number before login.", []);
                return;
            }

            const isMatch = await bcrypt.compare(password, ensureUser.password || "");
            if (!isMatch) {
                response_data(res, 401, "Invalid phone number or password", []);
                return;
            }

            let finalToken = ensureUser.refresh_token_hash;
            const isTokenValid = finalToken ? jwtService.verifyToken(finalToken) : false;

            if (!isTokenValid) {
                finalToken = jwtService.signRefreshToken({
                    user_id: str_val(ensureUser.user_id),
                    session_id: cryptoService.sessionId(),
                });
                await AppUser.updateOne(
                    { _id: ensureUser._id },
                    { $set: { refresh_token_hash: finalToken } }
                );
            }
            const collections = {
                refreshToken: finalToken,
                accessToken: jwtService.signAccessToken({
                    user_id: str_val(ensureUser.user_id),
                    session_id: cryptoService.sessionId()
                }),
            }
            const encrypted = cryptoService.encryptObject(collections);
            response_data(res, 200, "User login successfully", encrypted);
            return;
        } catch (error) {
            eLog("❌ Login error:", error);
            response_data(res, 500, "Internal server error", []);
            return;
        }
    }

    public async register(req: Request, res: Response) {
        try {
            const results = await this.protect_post<RegisterRequest>(req, res);
            if (!results) return;
            const { username, phone, password } = results;
            if (empty(username)) {
                response_data(res, 400, "Name is required", []);
                return;
            }
            if (empty(phone)) {
                response_data(res, 400, "Phone is required", []);
                return;
            }
            if (this.phoneRegex && !this.phoneRegex.test(phone)) {
                response_data(res, 400, "Invalid phone number format", []);
                return;
            }
            if (empty(password)) {
                response_data(res, 400, "Password is required", []);
                return;
            }
            const formatPhone = format_phone(phone);
            const existingUser = await AppUser.findOne({ phone: formatPhone }).select("phone").lean();
            if (existingUser) {
                response_data(res, 400, "Phone number already exists", []);
                return;
            }
            const verificationCode = random_number(6);
            // const smsResult = await send_sms.send_msg(phone, `Your verification code is ${verificationCode} \n Do not share this code with anyone.`);
            // if (smsResult.code !== 200) {
            //     response_data(res,500,"Failed to send verification SMS",[]);
            //     return;
            // }
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiresAtValue = expiresAt(3);
            await PhoneVerify.findOneAndUpdate(
                { phone: formatPhone },
                {
                    $set: {
                        code: verificationCode,
                        expiresAt: expiresAtValue,
                        tempData: {
                            name: username,
                            passwordHash: hashedPassword,
                        },
                    },
                },
                { upsert: true, new: true }
            );
            response_data(res, 200, "Verification code sent. Please verify your phone.", formatPhone);
            return;
        } catch (error) {
            eLog("Register error:", error);
            response_data(res, 500, "Internal server error", []);
            return;
        }
    }

    public async verifyPhone(req: Request, res: Response): Promise<void> {
        try {
            const results = await this.protect_post<VerifyPhoneRequest>(req, res);
            if (!results) return;
            const { phone, code } = results;
            if (empty(phone)) {
                response_data(res, 400, "Phone is required", []);
                return;
            }
            if (this.phoneRegex && !this.phoneRegex.test(phone)) {
                response_data(res, 400, "Invalid phone number format", []);
                return;
            }
            if (empty(code)) {
                response_data(res, 400, "Verification code is required", []);
                return;
            }
            const formatPhone = format_phone(phone);
            const phone_hash = cryptoService.hash(formatPhone);
            if (!phone_hash || !formatPhone) {
                response_data(res, 400, "Invalid phone number format", []);
                return;
            }

            const record = await PhoneVerify.findOne({ phone: formatPhone });
            if (!record) {
                response_data(res, 400, "No verification request found", []);
                return;
            }
            if (new Date() > record.expiresAt) {
                response_data(res, 400, "Verification code expired. Please request a new code.", []);
                return;
            }
            if (str_number(record.code) !== str_number(code)) {
                response_data(res, 400, "Verification code is incorrect", []);
                return;
            }
            if (!record.tempData?.name || !record.tempData?.passwordHash) {
                response_data(res, 400, "Invalid verification data", []);
                return;
            }

            const { name, passwordHash } = record.tempData;
            const newUserId = nextId();
            const sessionId = cryptoService.sessionId();
            const refreshToken = jwtService.signRefreshToken({
                user_id: str_val(newUserId),
                session_id: sessionId,
            });
            const accessToken = jwtService.signAccessToken({
                user_id: str_val(newUserId),
                session_id: sessionId,
            });
            const newUser = new AppUser({
                user_id: newUserId,
                name,
                phone: cryptoService.encrypt(formatPhone),
                phone_hash,
                password: passwordHash,
                phone_verified: true,
                refresh_token_hash: refreshToken
            });
            await newUser.save();
            await PhoneVerify.deleteOne({ phone: formatPhone });
            const collections = {
                refreshToken,
                accessToken,
            };
            response_data(res, 200, "User registered successfully", cryptoService.encryptObject(collections));
            return;
        } catch (error) {
            eLog("❌ Verify phone error:", error);
            response_data(res, 500, "Internal server error", []);
            return;
        }
    }

    public async resendCode(req: Request, res: Response): Promise<void> {
        try {
            const results = await this.protect_post<ResendCodeRequest>(req, res);
            if (!results) return;
            const { phone } = results;

            if (empty(phone)) {
                response_data(res, 400, "Phone is required", []);
                return;
            }
            const formatPhone = format_phone(phone);
            if (!formatPhone || (this.phoneRegex && !this.phoneRegex.test(formatPhone))) {
                response_data(res, 400, "Invalid phone number format", []);
                return;
            }
            const existing = await PhoneVerify.findOne({ phone: formatPhone });
            if (!existing) {
                response_data(res, 400, "Please register first.", []);
                return;
            }

            const verificationCode = random_number(6);
            // const smsResult = await send_sms.send_msg(
            //     formatPhone,
            //     `Your new code is ${verificationCode}. \n Do not share this code with anyone.`
            // );

            // if (smsResult.code !== 200) {
            //     response_data(res, 500, "Failed to send SMS", []);
            //     return;
            // }

            existing.code = verificationCode;
            existing.expiresAt = expiresAt(3);
            await existing.save();

            response_data(res, 200, "New OTP code sent successfully", []);
            return;
        } catch (error) {
            eLog("❌ Resend code error:", error);
            response_data(res, 500, "Internal server error", []);
            return;
        }
    }

    public async googleLogin(req: Request, res: Response): Promise<void> {
        try {
            const results = await this.protect_post<GoogleLoginRequest>(req, res);
            if (!results) return;
            const { google_token } = results;
            if (empty(google_token)) {
                response_data(res, 400, "Google token is required", []);
                return;
            }
            if (GOOGLE_TOKEN_REGEX && !GOOGLE_TOKEN_REGEX.test(google_token)) {
                response_data(res, 400, "Invalid Google token format", []);
                return;
            }
            const ticket = await googleOAuthClient.verifyIdToken({
                idToken: google_token,
                audience: GOOGLE_CLIENT_ID
            });
            const payload = ticket.getPayload();
            if (!payload) {
                response_data(res, 400, "Invalid Google token", []);
                return;
            }
            const { sub: google_id, email, name, picture } = payload;
            if (!google_id || !email || !name) {
                response_data(res, 400, "Invalid Google token payload", []);
                return;
            }
            const sessionId = cryptoService.sessionId();
            const email_hash = cryptoService.hash(email);
            const google_id_hash = cryptoService.hash(google_id);
            if (!email_hash || !google_id_hash) {
                response_data(res, 400, "Invalid email or Google ID", []);
                return;
            }

            let ensureUser = await AppUser.findOne({ email_hash }).select("+refresh_token_hash").lean();
            let finalRefreshToken = ensureUser?.refresh_token_hash;

            if (!ensureUser) {
                const newUserId = nextId();
                finalRefreshToken = jwtService.signRefreshToken({
                    user_id: str_val(newUserId),
                    session_id: sessionId,
                });
                const created = await AppUser.create({
                    user_id: newUserId,
                    name,
                    avatar: picture,
                    google_id,
                    google_id_hash,
                    email: cryptoService.encrypt(email) ?? "",
                    email_hash,
                    refresh_token_hash: finalRefreshToken
                });
                ensureUser = created.toObject();
            } else {
                const isTokenValid = finalRefreshToken ? jwtService.verifyToken(finalRefreshToken) : false;
                if (!isTokenValid) {
                    finalRefreshToken = jwtService.signRefreshToken({
                        user_id: str_val(ensureUser.user_id),
                        session_id: sessionId,
                    });
                    await AppUser.updateOne(
                        { _id: ensureUser._id },
                        {
                            $set: {
                                refresh_token_hash: finalRefreshToken,
                                name,
                                avatar: picture,
                            },
                        }
                    );
                }
            }
            const accessToken = jwtService.signAccessToken({
                user_id: String(ensureUser.user_id),
                session_id: sessionId,
            });
            const collections = {
                refreshToken: finalRefreshToken,
                accessToken
            };
            response_data(res, 200, "Google login successful", cryptoService.encryptObject(collections));
            return;
        } catch (err) {
            eLog("❌ Google login error:", err);
            response_data(res, 500, "Internal server error", []);
            return;
        }
    }

    public async get_user_profile(req: Request, res: Response) {
        try {
            const check_token = await this.protect_get<TokenData>(req, res);
            if (!check_token) return;
            const { user_id } = check_token;
            const user = await AppUser.findOne({ user_id }).lean();
            if (!user) {
                response_data(res, 401, "Unauthorized", []);
                return;
            }
            const settings = await model_settings.findOne({ user_id }).lean();
            const { emailNotifications, twoFactor } = settings?.user || { emailNotifications: false, twoFactor: false };
            const { email, phone, name, avatar, bio, point } = user;
            const collection = { avatar, fullName: name, username: name, email, phone, bio, points: point, emailNotifications, twoFactor };
            const encrypted = cryptoService.encryptObject(collection);
            return response_data(res, 200, "Success", encrypted);
        } catch (err) {
            eLog("Get user profile error:", getErrorMessage(err));
            return response_data(res, 500, "Internal server error", []);
        }
    }

    public async update_profile(req: Request, res: Response): Promise<Response | void> {
        try {
            const result = await this.protect_post<SaveUserProfile>(req, res, true);
            if (!result) return;
            const { user_id, avatar, username, email, phone, bio, emailNotifications, twoFactor } = result;
            const session = await mongoose.startSession();
            session.startTransaction();
            try {
                const user = await AppUser.findOne({ user_id }).session(session);
                if (!user) {
                    await session.abortTransaction();
                    return response_data(res, 401, "Unauthorized", []);
                }

                const settings = (await model_settings.findOne({ user_id }).session(session)) || new model_settings({ user_id });
                settings.user ||= { emailNotifications: false, twoFactor: false };
                settings.user.emailNotifications = emailNotifications;
                settings.user.twoFactor = twoFactor;

                user.avatar = avatar ?? "";
                user.name = username ?? "";
                user.email = email ?? "";
                user.phone = phone ?? "";
                user.bio = bio ?? "";

                await user.save({ session });
                await settings.save({ session });
                await session.commitTransaction();

                const collection = make_schema(result).omit(["user_id", "session_id", "token", "hash_key"]).get();
                const format_data = cryptoService.encryptObject(collection);
                return response_data(res, 200, "Success", format_data);
            } catch (err: unknown) {
                eLog(getErrorMessage(err));
                await session.abortTransaction();
                return response_data(res, 500, "Fail update profile", []);
            } finally {
                session.endSession();
            }
        } catch (err: unknown) {
            eLog("Update profile error:", getErrorMessage(err));
            return response_data(res, 500, "Internal server error", []);
        }
    }
}

export default new UserController;