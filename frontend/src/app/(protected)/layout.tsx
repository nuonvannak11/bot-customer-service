import { AuthProvider } from "@/contexts/AuthContext";
import { ensureUserLogin } from "@/libs/lib";
import Shell from "@/components/layout/Shell";
import { SocketProvider } from "@/contexts/SocketContext";
import {cryptoService} from "@/libs/crypto";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ensureUser = await ensureUserLogin();
  const { token, user, cookiesObj } = ensureUser;
  const defaultOpenState: Record<string, boolean> = {
    nexus_sidebar_telegram: cookiesObj["nexus_sidebar_telegram"] === "true",
  };
  const collection = { token, ...user };

  return (
    <AuthProvider user={collection}>
      <SocketProvider token={token}>
        <Shell
          option={{ hash_key: cryptoService.random_key(), user: collection, defaultOpenState: defaultOpenState }}
        >
          {children}
        </Shell>
      </SocketProvider>
    </AuthProvider>
  );
}
