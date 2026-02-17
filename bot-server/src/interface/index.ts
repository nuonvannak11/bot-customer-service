export interface JWTPayload {
  user_id: string;
  session_id: string;
  token?: string;
  iat?: number;
  exp?: number;
  [key: string]: any;
}

export interface SaveTelegramBotDTO {
  user_id: string;
  botToken: string;
  webhookUrl?: string;
  webhookEnabled?: boolean;
  notifyEnabled?: boolean;
  silentMode?: boolean;
  hash_key: string;
}

export interface SaveUserProfile {
  token: string;
  user_id: string;
  session_id: string;
  isAvatarUpdated: string,
  avatar: string,
  fullName: string,
  username: string,
  email: string,
  phone: string,
  bio: string,
  emailNotifications: string,
  twoFactor: string,
  hash_key: string;
}

export interface BotSettingDTO {
  max_upload_size: number;
  max_download_size: number;
  max_retry_download: number;
}

export interface FallbackPublish {
  url: string;
  channel: string,
  message: unknown;
}