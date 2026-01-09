"use client";

import { createContext, useContext, useState } from "react";
import { JWTPayload } from "@/types/auth";

interface AuthContextType {
  user: JWTPayload | null;
  setUser: (u: JWTPayload | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ user, children }: { user: JWTPayload; children: React.ReactNode }) {
  const [userState, setUserState] = useState<JWTPayload | null>(user);

  return (
    <AuthContext.Provider value={{ user: userState, setUser: setUserState }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
