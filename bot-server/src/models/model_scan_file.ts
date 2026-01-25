import mongoose, { Schema, Document } from "mongoose";

export interface IScanFile extends Document {
    user_id: string;
    chats: {
        chat_id: string;
        files: string[];
    }[];
    createdAt: Date;
}

const ScanFileSchema = new Schema({
    user_id: { type: String, required: true, index: true },
    chats: [
        {
            chat_id: { type: String, required: true },
            files: { type: [String], default: [] }
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IScanFile>("ScanFile", ScanFileSchema);
