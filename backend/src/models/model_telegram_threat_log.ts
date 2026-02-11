import mongoose, { Schema, Document } from "mongoose";

export interface IThreatLog extends Document {
    user_id: string;
    bot_token: string;
    chatId: string;
    chatType: string;
    offenderId?: number;
    offenderName?: string;
    threatType: string;
    content: string;
    action: string;
    actionDuration?: number;
    messageId?: number;
    createdAt: Date;
}

const ThreatLogSchema = new Schema(
    {
        user_id: { type: String, required: true },
        bot_token: { type: String, required: true },

        chatId: { type: String, required: true },
        chatType: { type: String, required: true },

        offenderId: Number,
        offenderName: String,

        threatType: { type: String, required: true },
        content: { type: String, required: true },

        action: { type: String, required: true },
        actionDuration: Number,

        messageId: Number,
    },
    { timestamps: true }
);

ThreatLogSchema.index({ bot_token: 1, chatId: 1, createdAt: -1 });
ThreatLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 60 }); // will delete in 60day

export default mongoose.model<IThreatLog>("telegram_threat_logs", ThreatLogSchema);
