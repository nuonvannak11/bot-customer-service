export interface JWTPayload {
  token: string;
  user_id?: string;
  [key: string]: unknown;
}