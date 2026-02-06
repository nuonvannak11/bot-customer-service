import type { TelegramBotSettingsConfig, UserProfileConfig } from "@/interface/index";

export const defaultTelegramConfig: TelegramBotSettingsConfig = {
    botUsername: "",
    botToken: "",
    is_process: false,
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

export const DEFAULT_ASSET = {
  chatId: 0,
  name: "",
  avatar: "tes",
  type: "Group",
  allowScan: false,
  upTime: 0,
  threatsBlocked: 0,
  safeFiles: 0,
  config: {
    blockedExtensions: [],
    blacklistedDomains: [],
    spam: {
      rateLimit: 0,
      duplicateSensitivity: 0,
      newUserRestriction: 0,
    },
    rulesCount: 0,
    blockAllLinksFromNoneAdmin: false,
    blockAllExstationFromNoneAdmin: false,
  },
};