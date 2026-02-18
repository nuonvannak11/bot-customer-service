import mongoose, { Document, Schema } from "mongoose";

export interface IMessageAlert<T = Record<string, unknown>> extends Document {
  user_id: string;
  chatId?: string;
  status: "pending" | "approved" | "rejected" | "info";
  isRead: boolean;
  type: string;
  title?: string;
  body?: string;
  payload?: T;
  createdAt: Date;
  updatedAt: Date;
}

export const MessageAlertSchema = new mongoose.Schema<IMessageAlert>(
  {
    user_id: { type: String, required: true, index: true },
    chatId: { type: String, index: true },
    status: { type: String, required: true, default: "pending" },
    type: { type: String, required: true },
    title: String,
    body: String,
    isRead: { type: Boolean, default: false, index: true },
    payload: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

MessageAlertSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });
export default mongoose.model("MessageAlert", MessageAlertSchema);

