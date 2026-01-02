"use client";

import { createContext, useContext, useEffect, useReducer } from "react";
import { useSocket } from "./SocketContext";

const WalletContext = createContext<any>(null);

function reducer(state: any, action: any) {
  switch (action.type) {
    case "WALLET_UPDATE":
      return { ...state, balance: action.payload.balance };
    default:
      return state;
  }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { socket } = useSocket();
  const [state, dispatch] = useReducer(reducer, { balance: 0 });

  useEffect(() => {
    if (!socket) return;

    socket.on("wallet_update", (payload:any) => {
      dispatch({ type: "WALLET_UPDATE", payload });
    });

    return () => {
      socket.off("wallet_update");
    };
  }, [socket]);

  return (
    <WalletContext.Provider value={state}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
