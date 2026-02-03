import { JWTPayload } from "@/@types/auth";

export interface SocketPayload {
  token: string;
  socket_url: string;
}

export type AuthResponse<T = unknown> = {
  code: number;
  message: string;
  data: T;
};

export type ResponseData = {
  code: number;
  message: string;
  data: any;
};

export type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};