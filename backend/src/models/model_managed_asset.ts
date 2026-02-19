import mongoose from "mongoose";

export interface IManagedAsset extends mongoose.Document {
    user_id: string;
    bot_token_hash: string;
    chatId: string;
    name: string;
    avatar: string;
    type: "private" | "group" | "supergroup" | "channel";
    allowScan: boolean;
    upTime: number;
    config: {
        blockedExtensions: string[];
        blacklistedDomains: string[];
        badWords: string[];
        spam: {
            rateLimit: number;
            duplicateSensitivity: number;
            newUserRestriction: number;
        };
        rulesCount: number;
        blockAllLinksFromNoneAdmin: boolean;
        blockAllExstationFromNoneAdmin: boolean;
        blockBadWordsEnabled: boolean;
    };
    threatsBlocked: number;
    safeFiles: number;
}

const spamSchema = new mongoose.Schema(
    {
        rateLimit: { type: Number, default: 0 },
        duplicateSensitivity: { type: Number, default: 0 },
        newUserRestriction: { type: Number, default: 0 },
    },
    { _id: false }
);

const configSchema = new mongoose.Schema(
    {
        blockedExtensions: { type: [String], default: [] },
        blacklistedDomains: { type: [String], default: [] },
        badWords: { type: [String], default: [] },
        spam: { type: spamSchema, default: () => ({}) },
        rulesCount: { type: Number, default: 0 },
        blockAllLinksFromNoneAdmin: { type: Boolean, default: false },
        blockAllExstationFromNoneAdmin: { type: Boolean, default: false },
        blockBadWordsEnabled: { type: Boolean, default: false },
    },
    { _id: false }
);

const managedAssetSchema = new mongoose.Schema(
    {
        user_id: { type: String, required: true },
        bot_token_hash: { type: String, required: true },
        chatId: { type: String, required: true, },
        name: { type: String, required: true },
        avatar: { type: String, default: "" },
        type: {
            type: String,
            enum: ["private", "group", "supergroup", "channel"],
            required: true,
        },

        allowScan: { type: Boolean, default: false },
        upTime: { type: Number, default: 0 },
        config: {
            type: configSchema,
            default: () => ({}),
        },
        threatsBlocked: { type: Number, default: 0 },
        safeFiles: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
);
managedAssetSchema.index({ user_id: 1, bot_token: 1, chatId: 1 }, { unique: true });
export default mongoose.model<IManagedAsset>("managed_asset", managedAssetSchema);
