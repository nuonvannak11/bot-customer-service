import mongoose from "mongoose";

const PlatformSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AppUser",
            required: true,
        },
        platform: {
            type: String,
            enum: ["facebook", "telegram", "tiktok"],
            required: true,
        },

        page_id: { type: String },
        page_name: { type: String },
        page_access_token: { type: String },
        token_expire_at: { type: Date },

        bot_token: { type: String },
        bot_username: { type: String },
        api_id: { type: String },
        api_hash: { type: String },

        tiktok_openid: { type: String },
        tiktok_token: { type: String },

        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

PlatformSchema.index({ userId: 1, platform: 1 });

export default mongoose.model("Platform", PlatformSchema);
