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

export interface CheckAuthResponse {
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

export interface SetStateProps<T> {
  state: T;
  setState: React.Dispatch<React.SetStateAction<T>>;
}

export interface ParseJWTPayload {
  user_id: string;
  session_id: string;
}

export interface EnsureUserLoginProp { 
  user: CheckAuthResponse, 
  token: string ,
  cookiesObj: Record<string, string>
};