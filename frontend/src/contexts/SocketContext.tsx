"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { SocketPayload } from "@/types/type";

type SocketContextType = {
  socket: Socket | null;
  connected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

interface SocketProviderProps {
  data: SocketPayload;
  children: React.ReactNode;
}

export function SocketProvider({ data, children }: SocketProviderProps) {
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  if (!data?.token) {
    return (
      <SocketContext.Provider value={{ socket: null, connected: false }}>
        {children}
      </SocketContext.Provider>
    );
  }

  useEffect(() => {
    if (!data.socket_url || !data.token) return;
    const newSocket = io(data.socket_url, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
      auth: {
        token: data.token,
      },
    });

    setSocketInstance(newSocket);

    newSocket.on("connect", () => setConnected(true));
    newSocket.on("disconnect", () => setConnected(false));

    return () => {
      newSocket.disconnect();
    };
  }, [data.socket_url, data.token]);

  return (
    <SocketContext.Provider value={{ socket: socketInstance, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
