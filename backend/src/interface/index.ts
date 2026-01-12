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
