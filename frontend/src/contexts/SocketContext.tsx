"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { socket } from "@/libs/socket";

type SocketContextType = {
  socket: typeof socket | null;
  connected: boolean;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
  connected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
