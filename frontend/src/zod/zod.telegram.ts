import { z } from "zod";

export const TelegramChatTypeSchema = z.enum([
    "private",
    "group",
    "supergroup",
    "channel",
]);

export const SpamConfigSchema = z.object({
    rateLimit: z.number(),
    duplicateSensitivity: z.number(),
    newUserRestriction: z.number(),
});

export const ChannelConfigSchema = z.object({
    blockedExtensions: z.array(z.string()).optional(),
    blacklistedDomains: z.array(z.string()).optional(),
    spam: SpamConfigSchema,
    rulesCount: z.number(),
    blockAllLinksFromNoneAdmin: z.boolean(),
    blockAllExstationFromNoneAdmin: z.boolean(),
});

export const GroupChannelSchema = z.object({
    chatId: z.string(),
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
    asset_key: z.string(),
    hash_key: z.string(),
    asset: GroupChannelSchema,
});