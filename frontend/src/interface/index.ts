import { NextResponse } from "next/server";
import { ConfrimGroupChanel } from "./interface.telegram";

export interface TelegramBotSettingsConfig {
  botUsername: string;
  botToken: string;
  webhookUrl: string;
  webhookEnabled: boolean;
  is_process: boolean;
  notifyEnabled: boolean;
  silentMode: boolean;
  exceptionLinks: string[];
  exceptionFiles: string[];
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
  token: string,
  cookiesObj: Record<string, string>
};

export interface SocketPayload {
  token: string;
  socket_url: string;
}

export interface JWTPayload {
  token: string;
  user_id?: string;
  [key: string]: unknown;
}

export interface AlertRule {
  id: string;
  name: string;
  severity: string;
  channel: string;
  active: boolean;
};

export interface AlertsClientProps {
  initialRules: AlertRule[];
};

export interface SocketState {
  notifications: any[];
  lastScanResult: any | null;
  confirmGroupEvent: ConfrimGroupChanel | null;

  addNotification: (data: any) => void;
  setLastScanResult: (data: any) => void;
  setConfirmGroupEvent: (data: ConfrimGroupChanel | null) => void;
}

export interface SetTokenCookies {
  res: NextResponse;
  name: string;
  value: string;
  maxAge: number;
  secure: boolean;
}

export interface ApiResponse<T = unknown> {
    code: number;
    message: string;
    data: T;
}
