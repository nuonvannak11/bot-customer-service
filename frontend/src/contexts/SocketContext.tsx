"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SocketPayload } from "@/@types/type";

type SocketContextType = {
  socket: Socket | null;
  connected: boolean;
};

interface SocketProviderProps {
  option: SocketPayload;
  children: React.ReactNode;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

export function SocketProvider({ option, children }: SocketProviderProps) {
  const socketRef = useRef<Socket | null>(null);
  const [socketState, setSocketState] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!option?.socket_url || !option?.token) return;

    const socket = io(option.socket_url, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      auth: { token: option.token },
    });

    socketRef.current = socket;

    queueMicrotask(() => setSocketState(socket));

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.disconnect();

      socketRef.current = null;
      setConnected(false);
      queueMicrotask(() => setSocketState(null));
    };
  }, [option?.socket_url, option?.token]);

  return (
    <SocketContext.Provider value={{ socket: socketState, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
