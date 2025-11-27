import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AppUser from "../models/model_user";
import SendSMS from "../services/send_sms";
import Platform from "../models/model_platform";
import { get_env, empty, random_number } from "../utils/util";

class UserController {
    constructor() {
        
    }

    async login(req: Request, res: Response) {
        const { phone, password } = req.body;
        try {
            const user = await AppUser.findOne({ phone });
            if (!user) {
                return res.status(401).json({ message: "Invalid credentials" });
            }
            const isMatch = await bcrypt.compare(password, user.password || "");
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid credentials" });
            }
            const token = jwt.sign({ userId: user._id }, get_env("JWT_SECRET"));
            res.json({ token });
        } catch (error) {
            res.status(500).json({ message: "Internal server error" });
        }
    }

    async register(req: Request, res: Response) {
        const { name, phone, password } = req.body;
        try {
            const mapError = {
                name: "Name is required",
                phone: "Phone is required",
                password: "Password is required",
            }
            for (const key in mapError) {
                if (empty(req.body[key])) {
                    return res.status(400).json({ code: 400, message: mapError[key as keyof typeof mapError] });
                }
            }
            const phoneRegex = /^\+?[1-9]\d{1,14}$/;
            if (!phoneRegex.test(phone)) {
                return res.status(400).json({ code: 400, message: "Invalid phone number format" });
            }
            const existingUser = await AppUser.findOne({ phone });
            if (existingUser) {
                return res.status(400).json({ code: 400, message: "User already exists" });
            }
            const send_sms = new SendSMS();
            const verificationCode = random_number(6);
            const smsResult = await send_sms.send_msg(phone, `Your verification code is ${verificationCode} \n Do not share this code with anyone.`);
            if (smsResult.code !== 200) {
                return res.status(500).json({ code: 500, message: "Failed to send verification SMS" });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = new AppUser({ name, phone, password: hashedPassword });
            await newUser.save();

            res.status(201).json({ code: 201, message: "User registered successfully" });
        } catch (error) {
            res.status(500).json({ code: 500, message: "Internal server error" });
        }
    }

    async googleLogin(req: Request, res: Response) {
        try {
            const { googleToken } = req.body;

            if (!googleToken) {
                return res.status(400).json({ message: "Missing Google token" });
            }
            const client = new OAuth2Client(get_env("GOOGLE_CLIENT_ID"));
            const ticket = await client.verifyIdToken({
                idToken: googleToken,
                audience: get_env("GOOGLE_CLIENT_ID")
            });

            const payload = ticket.getPayload();

            if (!payload) {
                return res.status(400).json({ message: "Invalid Google token" });
            }

            const { sub: google_id, email, name, picture } = payload;

            let user = await AppUser.findOne({ google_id });

            if (!user) {
                user = await AppUser.create({
                    google_id,
                    email,
                    name,
                    avatar: picture
                });
            }

            const token = jwt.sign({ userId: user._id }, get_env("JWT_SECRET"), {
                expiresIn: "7d",
            });

            res.status(200).json({
                token,
                user
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Google login failed" });
        }
    }
}

export default UserController;