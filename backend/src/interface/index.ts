export interface JWTPayload {
  user_id: string;
  session_id: string;
  token?: string;
  iat?: number;
  exp?: number;
  [key: string]: any;
}

export interface SaveTelegramBotDTO {
  botToken: string;
  webHook?: string;
  enableWebHook?: boolean;
  pushNotifications?: boolean;
  silentMode?: boolean;
  hash_key: string;
}
