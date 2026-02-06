import mongoose, { Schema, Document } from "mongoose";

export interface IGroup extends Document {
    user_id: string;
    bot_token: string;
    chatId: string;
    name: string;
    type: string;
    avatar: string;
    memberCount: number;
    createdAt: Date;
}

const GroupSchema = new Schema({
    user_id: { type: String, required: true },
    bot_token: { type: String, required: true},
    chatId: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    avatar: { type: String, default: null },
    memberCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

GroupSchema.index({ user_id: 1, bot_token: 1, chatId: 1 }, { unique: true });

export default mongoose.model<IGroup>("telegram_group_chanel", GroupSchema);