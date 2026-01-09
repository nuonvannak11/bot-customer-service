import { JWTPayload } from "@/types/auth";

export interface SocketPayload extends JWTPayload{
  socket_url: string;
}