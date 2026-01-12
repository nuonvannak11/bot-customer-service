export interface JWTPayload {
  user_id: string;
  session_id: string;
  token?: string;
  iat?: number;
  exp?: number;
  [key: string]: any;
}
