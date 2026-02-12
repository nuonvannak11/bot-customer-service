import { z } from "zod";

const hashKeySchema = z
    .string()
    .min(10)
    .max(100)
    .regex(/^[A-Za-z0-9+/=]+$/, "Invalid hash format");

const chatIdSchema = z
    .union([z.string(), z.number()])
    .transform((value) => String(value).trim())
    .refine((value) => value.length > 0, "chatId is required");

const DeleteAssetSchema = z.object({
    chatId: chatIdSchema,
});

export const ProtectActionSchema = z.enum(["add", "update", "delete"]);

export const TelegramChatTypeSchema = z.enum([
    "private",
    "group",
    "supergroup",
    "channel",
    "Group",
    "Channel",
]);

export const SpamConfigSchema = z.object({
    rateLimit: z.number(),
    duplicateSensitivity: z.number(),
    newUserRestriction: z.number(),
});

export const ChannelConfigSchema = z.object({
    blockedExtensions: z.array(z.string()).optional(),
    blacklistedDomains: z.array(z.string()).optional(),
    badWords: z.array(z.string()).optional(),
    spam: SpamConfigSchema,
    rulesCount: z.number(),
    blockAllLinksFromNoneAdmin: z.boolean(),
    blockAllExstationFromNoneAdmin: z.boolean(),
    blockBadWordsEnabled: z.boolean(),
});

export const GroupChannelSchema = z.object({
    chatId: chatIdSchema,
    name: z.string(),
    avatar: z.string().optional(),
    type: TelegramChatTypeSchema,
    allowScan: z.boolean(),
    upTime: z.number(),
    threatsBlocked: z.number(),
    safeFiles: z.number(),
    config: ChannelConfigSchema,
});

export const ProtectRequestSchema = z.object({
    asset_key: ProtectActionSchema,
    hash_key: hashKeySchema,
    asset: z.union([GroupChannelSchema, DeleteAssetSchema]),
}).strict().superRefine((value, ctx) => {
    if (value.asset_key === "delete") {
        const parsedDeleteAsset = DeleteAssetSchema.safeParse(value.asset);
        if (!parsedDeleteAsset.success) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["asset", "chatId"],
                message: "chatId is required for delete action",
            });
        }
    }

    if (value.asset_key === "add" || value.asset_key === "update") {
        const parsedGroupAsset = GroupChannelSchema.safeParse(value.asset);
        if (!parsedGroupAsset.success) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["asset"],
                message: "Full asset payload is required for add/update action",
            });
        }
    }
});

export const telegramPayloadSchema = z.object({
    hash_key: hashKeySchema,
    botToken: z.string().min(10).max(100),
    is_process: z.boolean().optional(),
    webhookUrl: z.string().optional(),
    webhookEnabled: z.boolean().optional(),
    notifyEnabled: z.boolean().optional(),
    silentMode: z.boolean().optional(),
    exceptionLinks: z.array(z.string()).optional(),
    exceptionFiles: z.array(z.string()).optional(),
    botUsername: z.string().optional(),
});
