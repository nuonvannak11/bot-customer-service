// libs/parseTelegramSettings.ts
import { defaultTelegramConfig } from "@/default/default";
import type { TelegramBotSettingsConfig } from "@/interface/index";

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
