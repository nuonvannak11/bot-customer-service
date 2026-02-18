"use client";

import { SocketManagerProvider } from "@/sockets/socketManager";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type SocketContextType = {
  socket: Socket | null;
  connected: boolean;
};

interface SocketProviderProps {
  token: string;
  children: React.ReactNode;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

export function SocketProvider({ token, children }: SocketProviderProps) {
  const socketRef = useRef<Socket | null>(null);
  const [socketState, setSocketState] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const socket = io("http://localhost:3200", {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      auth: { token },
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
  }, [token]);

  return (
    <SocketContext.Provider value={{ socket: socketState, connected }}>
      <SocketManagerProvider>
        {children}
      </SocketManagerProvider>
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
