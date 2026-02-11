import mongoose, { Schema, Document } from "mongoose";

export interface ITelegramMessage extends Document {
    user_id: string;
    bot_token: string;
    chatId: string;
    chatType: string;
    messageId: number;
    fromId?: number;
    fromName?: string;
    text?: string;
    mediaType?: string;
    date: Date;
}

const TelegramMessageSchema = new Schema({
    user_id: { type: String, required: true },
    bot_token: { type: String, required: true },
    chatId: { type: String, required: true },
    chatType: { type: String, required: true },
    messageId: { type: Number, required: true },

    fromId: { type: Number },
    fromName: { type: String },

    text: { type: String },
    mediaType: { type: String },

    date: { type: Date, default: Date.now },
}, { timestamps: true });

TelegramMessageSchema.index(
    { bot_token: 1, chatId: 1, messageId: 1 },
    { unique: true }
);

export default mongoose.model<ITelegramMessage>(
    "telegram_messages",
    TelegramMessageSchema
);
