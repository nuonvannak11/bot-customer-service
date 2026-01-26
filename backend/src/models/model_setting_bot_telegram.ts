import mongoose, { Schema, Document } from "mongoose";

export interface ITelegramSettingBot extends Document {
    max_download_size: number;
    max_upload_size: number;
    max_retry_download: number;
    createdAt: Date;
}

const SettingTelegramBotSchema: Schema = new Schema({
    max_download_size: { type: Number, default: 0 },
    max_upload_size: { type: Number, default: 0 },
    max_retry_download: { type: Number, default: 5 },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<ITelegramSettingBot>("setting_telegram_bot", SettingTelegramBotSchema);