import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcryptjs";
import AppUser from "../models/model_user";
import HashData from "../helper/hash_data";
import CheckJWT from "../helper/check_jwt";
import PhoneVerify from "../models/model_phone_verify";
import SendSMS from "../services/send_sms";
import Platform from "../models/model_platform";
import { PHONE_REGEX, EMAIL_REGEX, GOOGLE_TOKEN_REGEX, EXPIRE_TOKEN_TIME } from "../constants";
import { get_env, empty, random_number, expiresAt, eLog } from "../utils/util";

class UserController {
    private phoneRegex: RegExp;
    private emailRegex: RegExp;
    private hashData: HashData;
    private checkJWT: CheckJWT;

    constructor() {
        this.phoneRegex = PHONE_REGEX;
        this.emailRegex = EMAIL_REGEX;
        this.hashData = new HashData();
        this.checkJWT = new CheckJWT();
    }

    async login(req: Request, res: Response) {
        const { phone, password } = req.body;
        try {
            const formatPhone = this.hashData.decryptData(phone);
            const formatPassword = this.hashData.decryptData(password);
            const validate = () => {
                const errors: string[] = [];
                if (empty(formatPhone)) errors.push("Phone is required");
                if (empty(formatPassword)) errors.push("Password is required");
                if (!empty(formatPhone) && this.phoneRegex && !this.phoneRegex.test(formatPhone)) {
                    errors.push("Invalid phone number format");
                }
                return errors;
            };
            const validationErrors = validate();
            if (validationErrors.length > 0) {
                return res.status(200).json({ code: 400, message: validationErrors[0] });
            }
            const user = await AppUser.findOne({ phone: formatPhone });
            if (!user) {
                return res.status(200).json({ code: 401, message: "Invalid user not found" });
            }
            if (!user.phone_verified) {
                return res.status(200).json({ code: 403, message: "Please verify your phone number before login." });
            }
            const isMatch = await bcrypt.compare(formatPassword, user.password || "");
            if (!isMatch) {
                return res.status(200).json({ code: 401, message: "Invalid password" });
            }
            const get_token = user.access_token;
            const check_token = this.checkJWT.verifyToken(get_token || "");
            if (!check_token.status) {
                const token = this.checkJWT.generateToken(
                    { userId: String(user._id) },
                    EXPIRE_TOKEN_TIME
                );
                const updatedUser = await AppUser.updateOne(
                    { _id: user._id },
                    {
                        $set: {
                            access_token: token,
                        },
                    }
                );
                if (updatedUser.modifiedCount === 0) {
                    return res.status(200).json({ code: 500, message: "User update failed" });
                }
                const collections = {
                    platforms: await Platform.find({ userId: user._id }),
                    user,
                }
                const encryptedCollections = this.hashData.encryptData(JSON.stringify(collections));
                res.status(200).json({ token, data: encryptedCollections });
            } else {
                const collections = {
                    platforms: await Platform.find({ userId: user._id }),
                    user,
                }
                const encryptedCollections = this.hashData.encryptData(JSON.stringify(collections));
                res.status(200).json({ token: get_token, data: encryptedCollections });
            }
        } catch (error) {
            res.status(200).json({ code: 500, message: "Internal server error" });
        }
    }

    async register(req: Request, res: Response) {
        const { name, phone, password } = req.body;
        try {
            const formatPhone = this.hashData.decryptData(phone);
            const formatPassword = this.hashData.decryptData(password);
            const formatName = this.hashData.decryptData(name);
            const validate = () => {
                const errors: string[] = [];
                if (empty(formatName)) errors.push("Name is required");
                if (empty(formatPhone)) errors.push("Phone is required");
                if (empty(formatPassword)) errors.push("Password is required");
                if (!empty(formatPhone) && this.phoneRegex && !this.phoneRegex.test(formatPhone)) {
                    errors.push("Invalid phone number format");
                }
                return errors;
            };
            const validationErrors = validate();
            if (validationErrors.length > 0) {
                return res.status(200).json({ code: 400, message: validationErrors[0] });
            }
            if (this.phoneRegex && !this.phoneRegex.test(formatPhone)) {
                return res.status(200).json({ code: 400, message: "Invalid phone number format" });
            }
            const existingUser = await AppUser.findOne({ phone: formatPhone });
            if (existingUser) {
                return res.status(200).json({ code: 400, message: "User already exists" });
            }
            const send_sms = new SendSMS();
            const verificationCode = random_number(6);
            const smsResult = await send_sms.send_msg(formatPhone, `Your verification code is ${verificationCode} \n Do not share this code with anyone.`);
            if (smsResult.code !== 200) {
                return res.status(200).json({ code: 500, message: "Failed to send verification SMS" });
            }
            const hashedPassword = await bcrypt.hash(formatPassword, 10);
            const expiresAtValue = expiresAt(3); // 3 min
            await PhoneVerify.findOneAndUpdate(
                { phone: formatPhone },
                {
                    code: verificationCode,
                    expiresAt: expiresAtValue,
                    tempData: { name: formatName, passwordHash: hashedPassword },
                },
                { upsert: true, new: true }
            );
            return res.status(200).json({ code: 200, message: "Verification code sent. Please verify your phone." });
        } catch (error) {
            res.status(200).json({ code: 500, message: "Internal server error" });
        }
    }

    async verifyPhone(req: Request, res: Response) {
        const { phone, code } = req.body;
        try {
            const formatPhone = this.hashData.decryptData(phone);
            const formatCode = this.hashData.decryptData(code);
            const validate = () => {
                const errors: string[] = [];
                if (empty(formatPhone)) errors.push("Phone is required");
                if (empty(formatCode)) errors.push("Verification code is required");
                if (!empty(formatPhone) && this.phoneRegex && !this.phoneRegex.test(formatPhone)) {
                    errors.push("Invalid phone number format");
                }
                return errors;
            };
            const validationErrors = validate();
            if (validationErrors.length > 0) {
                return res.status(200).json({ code: 400, message: validationErrors[0] });
            }
            const record = await PhoneVerify.findOne({ phone: formatPhone });
            if (!record) {
                return res.status(200).json({ code: 400, message: "No verification request found" });
            }

            if (new Date() > record.expiresAt) {
                await PhoneVerify.deleteOne({ phone: formatPhone });
                return res.status(400).json({ code: 400, message: "Verification code expired" });
            }

            if (record.code !== formatCode) {
                return res.status(200).json({ code: 400, message: "Invalid verification code" });
            }
            if (!record.tempData || !record.tempData.name || !record.tempData.passwordHash) {
                return res.status(200).json({ code: 400, message: "Incomplete verification data" });
            }

            const { name, passwordHash } = record.tempData;
            const newUser = new AppUser({ name, phone: formatPhone, password: passwordHash, phone_verified: true });
            await newUser.save();
            await PhoneVerify.deleteOne({ phone: formatPhone });
            const user = await AppUser.findOne({ phone: formatPhone });
            if (!user) {
                return res.status(200).json({ code: 500, message: "User creation failed" });
            }

            const token = this.checkJWT.generateToken(
                { userId: String(user._id) },
                EXPIRE_TOKEN_TIME
            );

            await AppUser.updateOne(
                { _id: user._id },
                { $set: { access_token: token } }
            );

            const collections = {
                platforms: await Platform.find({ userId: user._id }),
                user,
            };

            const encryptedCollections = this.hashData.encryptData(JSON.stringify(collections));
            res.status(200).json({
                code: 200,
                message: "Phone verified and user registered successfully",
                token,
                data: encryptedCollections
            });
        } catch (error) {
            eLog(error);
            res.status(500).json({ code: 500, message: "Internal server error" });
        }
    }

    async resendCode(req: Request, res: Response) {
        const { phone } = req.body;
        try {
            const formatPhone = this.hashData.decryptData(phone);
            if (!formatPhone || (this.phoneRegex && !this.phoneRegex.test(formatPhone))) {
                return res.status(200).json({ code: 400, message: "Invalid phone number format" });
            }
            const existing = await PhoneVerify.findOne({ phone: formatPhone });
            if (!existing) {
                return res.status(200).json({ code: 400, message: "Please register first." });
            }

            const verificationCode = random_number(6);
            const send_sms = new SendSMS();
            const smsResult = await send_sms.send_msg(formatPhone, `Your new code is ${verificationCode}. \n Do not share this code with anyone.`);

            if (smsResult.code !== 200) {
                return res.status(500).json({ code: 500, message: "Failed to send SMS" });
            }

            existing.code = verificationCode;
            existing.expiresAt = expiresAt(3); // 3 minutes from now
            await existing.save();

            res.status(200).json({ code: 200, message: "New code sent successfully." });
        } catch (error) {
            res.status(500).json({ code: 500, message: "Internal server error" });
        }
    }

    async googleLogin(req: Request, res: Response) {
        try {
            const { googleToken } = req.body;
            const formatGoogleToken = this.hashData.decryptData(googleToken);
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
            let user = await AppUser.findOne({ $or: [{ google_id }, { email }] });

            if (user) {
                const check_token = this.checkJWT.verifyToken(user.access_token || "");
                let token = user.access_token;

                if (!check_token.status) {
                    token = this.checkJWT.generateToken({ userId: String(user._id) }, EXPIRE_TOKEN_TIME);
                    await AppUser.updateOne(
                        { _id: user._id },
                        { $set: { access_token: token, name, avatar: picture } }
                    );
                }

                const collections = {
                    platforms: await Platform.find({ userId: user._id }),
                    user,
                };
                const encryptedCollections = this.hashData.encryptData(JSON.stringify(collections));
                return res.status(200).json({
                    code: 200,
                    message: "Google login successful",
                    token,
                    data: encryptedCollections,
                });
            }
            user = await AppUser.create({
                google_id,
                email,
                name,
                avatar: picture,
                phone_verified: false,
            });

            const token = this.checkJWT.generateToken(
                { userId: String(user._id) },
                EXPIRE_TOKEN_TIME
            );

            await AppUser.updateOne(
                { _id: user._id },
                { $set: { access_token: token } }
            );

            const collections = {
                platforms: await Platform.find({ userId: user._id }),
                user,
            };

            const encryptedCollections = this.hashData.encryptData(JSON.stringify(collections));
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
}

export default UserController;