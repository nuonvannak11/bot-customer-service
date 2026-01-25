import mongoose, { Schema, Document } from "mongoose";

export interface IBot extends Document {
    bot_id: number;
    is_bot: boolean;
    first_name: string;
    username: string;

    can_join_groups: boolean;
    can_read_all_group_messages: boolean;
    supports_inline_queries: boolean;

    avatar?: string;
    user_id: string;
    bot_token: string;

    createdAt: Date;
    updatedAt: Date;
}

const BotSchema = new Schema(
    {
        bot_id: { type: Number, required: true, unique: true, index: true },
        is_bot: { type: Boolean, default: true },

        first_name: { type: String, required: true },
        username: { type: String, required: true, unique: true },

        can_join_groups: { type: Boolean, default: false },
        can_read_all_group_messages: { type: Boolean, default: false },
        supports_inline_queries: { type: Boolean, default: false },

        avatar: { type: String, default: null },

        user_id: { type: String, required: true, index: true },
        bot_token: { type: String, required: true, unique: true, select: false }
    },
    { timestamps: true }
);

export default mongoose.model<IBot>("Bot", BotSchema);
