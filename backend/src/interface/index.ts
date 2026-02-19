import { IManagedAsset } from "../models/model_managed_asset";

export interface JWTPayload {
  user_id: string;
  session_id: string;
  token?: string;
  iat?: number;
  exp?: number;
  [key: string]: any;
}



export interface SaveUserProfile {
  token: string;
  user_id: string;
  session_id: string;
  isAvatarUpdated: string;
  avatar: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
  emailNotifications: boolean;
  twoFactor: boolean;
  hash_key: string;
}

export interface AuthData {
  user_id: string;
  session_id: string;
  token: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  error?: { code: number; message: string };
}

export interface IManagedAssetRequest {
  user_id: string;
  session_id: string;
  token: string;
  hash_key: string;
  asset_key: string;
  asset: IManagedAsset;
}

export interface IManagedAssetRemoveRequest {
  user_id: string;
  session_id: string;
  token: string;
  hash_key: string;
  asset_key: string;
  chatId: string;
}

export interface ScanFileProps {
  port: string;
  server_ip: string;
  user_id: string;
  chat_id: string;
  message_id: number;
}

export interface AddServerRequest {
  server_id: string;
  server_ip: string;
  server_port: string;
}

export interface FallbackPublish {
  url: string;
  channel: string;
  message: unknown;
}

export interface UnsafeFileProps {
  userId: string;
  server_ip: string;
  port: string;
}
