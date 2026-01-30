import type { TelegramBotSettingsConfig, UserProfileConfig } from "@/interface/index";

export const defaultTelegramConfig: TelegramBotSettingsConfig = {
    botUsername: "",
    botToken: "",
    webhookUrl: "",
    webhookEnabled: false,
    notifyEnabled: false,
    silentMode: false,
    exceptionLinks: [],
};

export const defaultUserProfileConfig: UserProfileConfig = {
    avatar: "https://buckets.onecontrol.store/assets/icon/user.png",
    fullName: "",
    username: "",
    email: "",
    phone: "",
    bio: "",
    points: 0,
    emailNotifications: false,
    twoFactor: false,
}