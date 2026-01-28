import { JWTPayload } from "@/@types/auth";

export interface SocketPayload extends JWTPayload {
  socket_url: string;
}

export type AuthResponse = {
  code: number;
  message: string;
  data: [];
};

export type ResponseData = {
  code: number;
  message: string;
  data: any;
};