import mongoose from "mongoose";

const AppUserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        avatar: { type: String },
        email: { type: String, unique: true, sparse: true },
        password: { type: String },

        phone: { type: String, unique: true, sparse: true },
        phone_verified: { type: Boolean, default: false },

        google_id: { type: String, unique: true, sparse: true },

        plan: {
            type: String,
            enum: ["free", "basic", "pro"],
            default: "free",
        },

        role: {
            type: String,
            enum: ["owner", "admin", "staff"],
            default: "owner",
        },
        
        connectedAccountsCount: {
            facebook: { type: Number, default: 0 },
            tiktok: { type: Number, default: 0 },
            telegram: { type: Number, default: 0 },
        }
    },
    { timestamps: true }
);
AppUserSchema.index({ name: 1, phone: 1, email: 1 });
export default mongoose.model("AppUser", AppUserSchema);
