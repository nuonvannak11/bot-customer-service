import { defaultTelegramConfig, defaultUserProfileConfig } from "@/default/default";
import type { TelegramBotSettingsConfig, UserProfileConfig } from "@/interface/index";

export function parse_telegram_bot_settings(data: any): TelegramBotSettingsConfig {
    return {
        botUsername: data?.botUsername ?? defaultTelegramConfig.botUsername,
        botToken: data?.botToken ?? defaultTelegramConfig.botToken,
        webhookUrl: data?.webhookUrl ?? defaultTelegramConfig.webhookUrl,
        webhookEnabled: data?.webhookEnabled ?? defaultTelegramConfig.webhookEnabled,
        notifyEnabled: data?.notifyEnabled ?? defaultTelegramConfig.notifyEnabled,
        silentMode: data?.silentMode ?? defaultTelegramConfig.silentMode,
    };
}

export function parse_user_profile(data: any): UserProfileConfig {
    return {
        avatar: data?.avatar ?? defaultUserProfileConfig.avatar,
        fullName: data?.fullName ?? defaultUserProfileConfig.fullName,
        username: data?.username ?? defaultUserProfileConfig.username,
        email: data?.email ?? defaultUserProfileConfig.email,
        phone: data?.phone ?? defaultUserProfileConfig.phone,
        bio: data?.bio ?? defaultUserProfileConfig.bio,
        points: data?.points ?? defaultUserProfileConfig.points,
        emailNotifications: data?.emailNotifications ?? defaultUserProfileConfig.emailNotifications,
        twoFactor: data?.twoFactor ?? defaultUserProfileConfig.twoFactor,
    };
}