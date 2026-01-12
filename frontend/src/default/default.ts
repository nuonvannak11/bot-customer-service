import type { TelegramBotSettingsConfig } from "@/interface/index";

export const defaultTelegramConfig: TelegramBotSettingsConfig = {
    botUsername: "",
    botToken: "",
    webhookUrl: "",
    webhookEnabled: false,
    notifyEnabled: false,
    silentMode: false,
};
