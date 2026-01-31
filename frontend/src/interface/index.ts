export interface TelegramBotSettingsConfig {
  botUsername: string;
  botToken: string;
  webhookUrl: string;
  webhookEnabled: boolean;
  is_process: boolean;
  notifyEnabled: boolean;
  silentMode: boolean;
  exceptionLinks: string[];
}

export interface UserProfileConfig {
  avatar: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
  points: number;
  emailNotifications: boolean;
  twoFactor: boolean;
}

export interface ProtectFileOptions {
    form?: FormData;
    field: string;
    maxSizeMB?: number;
    allowed?: string[];
}
