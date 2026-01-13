import mongoose from "mongoose";
import { IUser } from "../interface/interface_user";
export const AppUserSchema = new mongoose.Schema<IUser>(
    {
        user_id: { type: String, required: true, unique: true },
        email: { type: String, unique: true, sparse: true },
        phone: { type: String, unique: true, sparse: true },
        name: { type: String, required: true },
        bio: { type: String, default: "" },
        point: { type: Number, default: 0 },
        avatar: String,
        password: { type: String, select: false },
        phone_verified: { type: Boolean, default: false },
        google_id: { type: String, unique: true, sparse: true },
        access_token_hash: { type: String, select: false },
        refresh_token_hash: { type: String, select: false },
        plan: {
            type: String,
            enum: ["free", "basic", "pro"],
            default: "free"
        },
        role: {
            type: String,
            enum: ["owner", "admin", "user"],
            default: "user"
        },
        connectedAccountsCount: {
            facebook: { type: Number, default: 0 },
            tiktok: { type: Number, default: 0 },
            telegram: { type: Number, default: 0 },
        },
    },
    { timestamps: true }
);

export default mongoose.model<IUser>("AppUser", AppUserSchema);