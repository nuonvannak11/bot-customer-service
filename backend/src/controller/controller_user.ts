import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcryptjs";
import AppUser from "../models/model_user";
import hashData from "../helper/hash_data";
import HashKey from "../helper/hash_key";
import CheckJWT from "../helper/check_jwt";
import PhoneVerify from "../models/model_phone_verify";
import SendSMS from "../services/send_sms";
import Platform from "../models/model_platform";
import { PHONE_REGEX, EMAIL_REGEX, GOOGLE_TOKEN_REGEX, EXPIRE_TOKEN_TIME } from "../constants";
import { get_env } from "../utils/get_env";
import { empty, random_number, expiresAt, eLog, generate_string, str_number, format_phone } from "../utils/util";
import { RequestSchema } from "../helper";
import { get_session_id } from "../helper/random";
import { check_header } from "../libs/lib";

class UserController {
    private readonly phoneRegex = PHONE_REGEX;
    private readonly emailRegex = EMAIL_REGEX;

    public async login(req: Request, res: Response) {
        const is_header = check_header(req);
        if (!is_header) {
            return res.status(200).json({ code: 400, message: "Invalid request" });
        }
        const parsed = RequestSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(200).json({ code: 400, message: "Invalid request" });
        }
        const decrypt_data = hashData.decryptData(parsed.data.payload);
        if (!decrypt_data) {
            return res.status(200).json({ code: 400, message: "Invalid payload" });
        }
        const parse_data = JSON.parse(decrypt_data);
        const { phone, password, hash_key } = parse_data;
        const check_key = HashKey.decrypt(hash_key);
        if (!check_key) {
            return res.status(200).json({ code: 400, message: "Invalid hash key" });
        }
        try {
            const validate = () => {
                const errors: string[] = [];
                if (empty(phone)) errors.push("Phone is required");
                if (empty(password)) errors.push("Password is required");
                if (!empty(phone) && this.phoneRegex && !this.phoneRegex.test(phone)) {
                    errors.push("Invalid phone number format");
                }
                return errors;
            };
            const validationErrors = validate();
            if (validationErrors.length > 0) {
                return res.status(200).json({ code: 400, message: validationErrors[0] });
            }
            const user = await AppUser.findOne({ phone: phone }).select("+password +access_token_hash");
            if (!user) {
                return res.status(200).json({ code: 401, message: "Invalid user not found" });
            }
            if (!user.phone_verified) {
                return res.status(200).json({ code: 403, message: "Please verify your phone number before login." });
            }
            const isMatch = await bcrypt.compare(password, user.password || "");
            if (!isMatch) {
                return res.status(200).json({ code: 401, message: "Password is incorrect" });
            }

            const get_token = user.access_token_hash;
            const check_token = CheckJWT.verifyToken(get_token || "");

            if (!check_token.status) {
                const token = CheckJWT.generateToken(
                    {
                        user_id: String(user.user_id),
                        session_id: get_session_id(),
                    },
                    EXPIRE_TOKEN_TIME
                );
                const updatedUser = await AppUser.updateOne(
                    { _id: user._id },
                    {
                        $set: {
                            access_token_hash: token,
                        },
                    }
                );
                if (updatedUser.modifiedCount === 0) {
                    return res.status(200).json({ code: 500, message: "User update failed" });
                }
                return res.status(200).json({
                    code: 200,
                    message: "User login successfully",
                    token,
                });
            } else {
                return res.status(200).json({
                    code: 200,
                    message: "User login successfully",
                    token: get_token,
                });
            }
        } catch (error) {
            return res.status(200).json({ code: 500, message: "Internal server error" });
        }
    }

    public async register(req: Request, res: Response) {
        const is_header = check_header(req);
        if (!is_header) {
            return res.status(200).json({ code: 400, message: "Invalid request" });
        }
        const parsed = RequestSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(200).json({ code: 400, message: "Invalid request" });
        }
        const decrypt_data = hashData.decryptData(parsed.data.payload);
        if (!decrypt_data) {
            return res.status(200).json({ code: 400, message: "Invalid payload" });
        }
        const parse_data = JSON.parse(decrypt_data);
        const { username, phone, password, hash_key } = parse_data;
        const check_key = HashKey.decrypt(hash_key);
        if (!check_key) {
            return res.status(200).json({ code: 400, message: "Invalid hash key" });
        }
        try {
            const validate = () => {
                const errors: string[] = [];
                if (empty(username)) errors.push("Name is required");
                if (empty(phone)) errors.push("Phone is required");
                if (empty(password)) errors.push("Password is required");
                if (phone && this.phoneRegex && !this.phoneRegex.test(phone)) {
                    errors.push("Invalid phone number format");
                }
                return errors;
            };
            const validationErrors = validate();
            if (validationErrors.length > 0) {
                return res.status(200).json({ code: 400, message: validationErrors[0] });
            }
            const formatPhone = format_phone(phone);
            const existingUser = await AppUser.findOne({ phone: formatPhone });
            if (existingUser) {
                return res.status(200).json({ code: 400, message: "Phone number already exists" });
            }
            // const send_sms = new SendSMS();
            const verificationCode = random_number(6);
            // const smsResult = await send_sms.send_msg(phone, `Your verification code is ${verificationCode} \n Do not share this code with anyone.`);
            // if (smsResult.code !== 200) {
            //     return res.status(200).json({ code: 500, message: "Failed to send verification SMS" });
            // }
            const hashedPassword = await bcrypt.hash(password, 10);
            const expiresAtValue = expiresAt(3); // 3 min
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
            return res.status(200).json({ code: 200, message: "Verification code sent. Please verify your phone.", data: formatPhone });
        } catch (error) {
            res.status(200).json({ code: 500, message: "Internal server error" });
        }
    }

    public async verifyPhone(req: Request, res: Response) {
        const is_header = check_header(req);
        if (!is_header) {
            return res.status(200).json({ code: 400, message: "Invalid request" });
        }
        const parsed = RequestSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(200).json({ code: 400, message: "Invalid request" });
        }
        const decrypt_data = hashData.decryptData(parsed.data.payload);
        if (!decrypt_data) {
            return res.status(200).json({ code: 400, message: "Invalid payload" });
        }
        const parse_data = JSON.parse(decrypt_data);
        const { phone, code, hash_key } = parse_data;
        const check_key = HashKey.decrypt(hash_key);
        if (!check_key) {
            return res.status(200).json({ code: 400, message: "Invalid hash key" });
        }
        try {
            const validate = () => {
                const errors: string[] = [];
                if (empty(phone)) errors.push("Phone is required");
                if (empty(code)) errors.push("Verification code is required");
                if (!empty(phone) && !this.phoneRegex.test(phone)) {
                    errors.push("Invalid phone number format");
                }
                return errors;
            };

            const formatPhone = format_phone(phone);
            const validationErrors = validate();
            if (validationErrors.length > 0) {
                return res.status(200).json({ code: 400, message: validationErrors[0] });
            }
            const record = await PhoneVerify.findOne({ phone: formatPhone });
            if (!record) {
                return res.status(200).json({ code: 400, message: "No verification request found" });
            }

            if (new Date() > record.expiresAt) {
                return res.status(200).json({
                    code: 400,
                    message: "Verification code expired. Please request a new code."
                });
            }
            if (str_number(record.code) !== str_number(code)) {
                return res.status(200).json({ code: 400, message: "Cerification code is incorrect" });
            }
            if (!record.tempData || !record.tempData.name || !record.tempData.passwordHash) {
                return res.status(200).json({ code: 400, message: "Incomplete verification data" });
            }

            const { name, passwordHash } = record.tempData;
            const newUser = new AppUser({
                user_id: generate_string(),
                name,
                phone: formatPhone,
                password: passwordHash,
                phone_verified: true
            });
            await newUser.save();
            await PhoneVerify.deleteOne({ phone: formatPhone });
            const user = await AppUser.findOne({ phone: formatPhone });
            if (!user) {
                return res.status(200).json({ code: 500, message: "User creation failed" });
            }
            const token = CheckJWT.generateToken(
                {
                    user_id: user.user_id,
                    session_id: get_session_id(),
                },
                EXPIRE_TOKEN_TIME
            );
            await AppUser.updateOne(
                { _id: user._id },
                {
                    $set: {
                        access_token_hash: token
                    }
                }
            );
            return res.status(200).json({
                code: 200,
                message: "User registered successfully",
                token,
            });
        } catch (error) {
            eLog(error);
            res.status(500).json({ code: 500, message: "Internal server error" });
        }
    }

    public async resendCode(req: Request, res: Response) {
        const is_header = check_header(req);
        if (!is_header) {
            return res.status(200).json({ code: 400, message: "Invalid request" });
        }
        const parsed = RequestSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(200).json({ code: 400, message: "Invalid request" });
        }
        const decrypt_data = hashData.decryptData(parsed.data.payload);
        if (!decrypt_data) {
            return res.status(200).json({ code: 400, message: "Invalid payload" });
        }
        const parse_data = JSON.parse(decrypt_data);
        const { phone, hash_key } = parse_data;
        const check_key = HashKey.decrypt(hash_key);
        if (!check_key) {
            return res.status(200).json({ code: 400, message: "Invalid hash key" });
        }
        try {
            const formatPhone = format_phone(phone);
            if (!formatPhone || (this.phoneRegex && !this.phoneRegex.test(formatPhone))) {
                return res.status(200).json({ code: 400, message: "Invalid phone number format" });
            }
            const existing = await PhoneVerify.findOne({ phone: formatPhone });
            if (!existing) {
                return res.status(200).json({ code: 400, message: "Please register first." });
            }

            const verificationCode = random_number(6);
            //const send_sms = new SendSMS();
            //const smsResult = await send_sms.send_msg(formatPhone, `Your new code is ${verificationCode}. \n Do not share this code with anyone.`);

            //if (smsResult.code !== 200) {
            //    return res.status(500).json({ code: 500, message: "Failed to send SMS" });
            //}

            existing.code = verificationCode;
            existing.expiresAt = expiresAt(3);
            await existing.save();

            res.status(200).json({ code: 200, message: "New OTP code sent successfully." });
        } catch (error) {
            res.status(500).json({ code: 500, message: "Internal server error" });
        }
    }

    public async googleLogin(req: Request, res: Response) {
        try {
            const { googleToken } = req.body;
            const formatGoogleToken = hashData.decryptData(googleToken);
            const validate = () => {
                const errors: string[] = [];
                if (empty(formatGoogleToken)) errors.push("Google token is required");
                if (!empty(formatGoogleToken) && GOOGLE_TOKEN_REGEX && !GOOGLE_TOKEN_REGEX.test(formatGoogleToken)) {
                    errors.push("Invalid Google token format");
                }
                return errors;
            }
            const validationErrors = validate();
            if (validationErrors.length > 0) {
                return res.status(200).json({ code: 400, message: validationErrors[0] });
            }
            const client = new OAuth2Client(get_env("GOOGLE_CLIENT_ID"));
            const ticket = await client.verifyIdToken({
                idToken: formatGoogleToken,
                audience: get_env("GOOGLE_CLIENT_ID")
            });
            const payload = ticket.getPayload();
            if (!payload) {
                return res.status(200).json({ code: 400, message: "Invalid Google token" });
            }
            const { sub: google_id, email, name, picture } = payload;
            let user = await AppUser.findOne({ email }).select("+access_token_hash").lean();
            if (!user) {
                const created = await AppUser.create({
                    user_id: generate_string(),
                    google_id,
                    email,
                    name,
                    avatar: picture,
                    phone_verified: false,
                });
                user = created.toObject();
            }

            let token = user.access_token_hash;
            const check_token = CheckJWT.verifyToken(token || "");

            if (!check_token.status) {
                token = CheckJWT.generateToken(
                    {
                        user_id: String(user.user_id),
                        session_id: get_session_id(),
                    },
                    EXPIRE_TOKEN_TIME
                );
                await AppUser.updateOne(
                    { _id: user._id },
                    {
                        $set: {
                            access_token_hash: token,
                            name,
                            avatar: picture,
                        },
                    }
                );
            }

            const platforms = await Platform.find({ user_id: user.user_id }).lean();
            delete user.access_token_hash;
            const collections = { ...user, platforms };
            const encryptedCollections = hashData.encryptData(JSON.stringify(collections));

            return res.status(200).json({
                code: 200,
                message: "Google login successful",
                token,
                data: encryptedCollections,
            });
        } catch (err) {
            eLog(err);
            res.status(500).json({ code: 500, message: "Google login failed" });
        }
    }

    public async check_token(req: Request, res: Response) {
        try {
            const { token } = req.body;
            const check_token = CheckJWT.verifyToken(token);
            if (!check_token.status) {
                return res.status(200).json({ code: 401, message: "Invalid token" });
            } else {
                return res.status(200).json({ code: 200, message: "Valid token" });
            }
        } catch (err) {
            eLog(err);
        }
    }
}

export default UserController;