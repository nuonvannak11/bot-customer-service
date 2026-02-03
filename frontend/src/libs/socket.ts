import { io, Socket } from "socket.io-client";

export const socket = (url: string): Socket =>
  io(url, {
    transports: ["websocket"],
    autoConnect: false,
    reconnection: true,
  });
