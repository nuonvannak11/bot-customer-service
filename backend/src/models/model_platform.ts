import mongoose from "mongoose";
import { IPlatform } from "../interface/interface_platform";

const PlatformSchema = new mongoose.Schema<IPlatform>({
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
        },
        default: { data: [] }
    },
    telegram: {
        web_hook: { type: String, default: "" },
        bot: {
            type: [
                {
                    bot_username: String,
                    bot_token_enc: { type: String, required: true, select: false },
                    bot_token_hash: { type: String, required: true, select: false },
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
        },
        default: { bot: [], user: [] }
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
        },
        default: { data: [] }
    },
    active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<IPlatform>("Platform", PlatformSchema);
