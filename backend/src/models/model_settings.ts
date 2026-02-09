import mongoose from "mongoose";
import { ISetting } from "../interface/interface_setting";

const SettingSchema = new mongoose.Schema<ISetting>({
    user_id: { type: String, required: true, unique: true, index: true },
    user: {
        type: {
            exceptionFiles: { type: [String], default: [] },
            exceptionLinks: { type: [String], default: [] },
            emailNotifications: { type: Boolean, default: false },
            twoFactor: { type: Boolean, default: false },
        },
        default: { exceptionFiles: [], exceptionLinks: [], emailNotifications: false, twoFactor: false }
    },
    facebook: {
    },
    telegram: {
        type: {
            bot: {
                type: [
                    {
                        bot_token: { type: String, default: "" },
                        process: { type: Boolean, default: false },
                        enable_web_hook: { type: Boolean, default: false },
                        push_notifications: { type: Boolean, default: false },
                        silent_mode: { type: Boolean, default: false },
                    }
                ],
                default: []
            },
            user: {
                type: [
                    {
                        phone: { type: String, default: "" },
                        api_id: { type: String, default: "" },
                        process: { type: Boolean, default: false },
                        enable_web_hook: { type: Boolean, default: false },
                        push_notifications: { type: Boolean, default: false },
                        silent_mode: { type: Boolean, default: false },
                    }
                ],
                default: []
            }
        },
        default: { bot: [], user: [] }
    },

    tiktok: {
    },
    google: {
    },
    other: {
    },
    active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model<ISetting>("Setting", SettingSchema);
