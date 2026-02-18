import mongoose, { Schema, Document } from "mongoose";

export interface IFileStore extends Document {
    user_id: string;
    telegram_file_id: string;
    telegram_unique_id: string;
    telegram_chat_id?: string; 
    telegram_message_id?: number;
    file_name?: string;
    mime_type?: string;
    file_size: number;
    bot_token_id?: string;
    createdAt: Date;
}

const FileStoreSchema: Schema = new Schema({
    user_id: { type: String, required: true, index: true },
    telegram_file_id: { type: String, required: true },
    telegram_unique_id: { type: String, required: true },

    telegram_chat_id: { type: String, required: true, index: true },
    telegram_message_id: { type: Number, required: true, index: true },

    file_name: { type: String, default: "unknown" },
    mime_type: { type: String, default: "application/octet-stream" },
    file_size: { type: Number, default: 0 },
    bot_token_id: { type: String },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IFileStore>("FileStore", FileStoreSchema);