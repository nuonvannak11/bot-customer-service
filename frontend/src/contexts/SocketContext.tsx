"use client";

import { createContext, useContext, useEffect, useState } from "react";
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
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  if (!option?.token) {
    return (
      <SocketContext.Provider value={{ socket: null, connected: false }}>
        {children}
      </SocketContext.Provider>
    );
  }

  useEffect(() => {
    if (!option.socket_url || !option.token) return;
    const newSocket = io(option.socket_url, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      auth: {
        token: option.token,
      },
    });

    setSocketInstance(newSocket);

    newSocket.on("connect", () => setConnected(true));
    newSocket.on("disconnect", () => setConnected(false));

    return () => {
      newSocket.disconnect();
    };
  }, [option.socket_url, option.token]);

  return (
    <SocketContext.Provider value={{ socket: socketInstance, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
