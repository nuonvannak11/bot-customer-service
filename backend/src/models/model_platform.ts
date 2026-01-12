import mongoose from "mongoose";

const PlatformSchema = new mongoose.Schema({
    user_id: { type: String, required: true, unique: true, index: true },
    facebook: {
        data: {
            type: [
                {
                    page_id: { type: String, required: true },
                    page_name: String,
                    page_access_token_enc: { type: String, select: false },
                    token_expire_at: Date,
                }
            ],
            default: [],
        }
    },
    telegram: {
        bot: {
            type: [
                {
                    bot_username: { type: String},
                    bot_token_enc: { type: String, required: true, select: false },
                }
            ],
            default: [],
        },
        user: {
            type: [
                {
                    phone: { type: String, required: true },
                    api_id: { type: String, required: true },
                    api_hash_enc: { type: String, required: true, select: false },
                }
            ],
            default: [],
        }
    },
    tiktok: {
        data: {
            type: [
                {
                    tiktok_openid: String,
                    tiktok_token_enc: { type: String, select: false },
                }
            ],
            default: [],
        }
    },
    active: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model("Platform", PlatformSchema);
