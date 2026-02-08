import { SocketProvider } from "@/contexts/SocketContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ensureUserLogin, get_env } from "@/libs/lib";
import Shell from "@/components/layout/Shell";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const ensureUser = await ensureUserLogin();
  const { token, user, cookiesObj } = ensureUser;
  const defaultOpenState: Record<string, boolean> = {
    nexus_sidebar_telegram: cookiesObj["nexus_sidebar_telegram"] === "true",
  };
  const data_socket = { token, socket_url: get_env("SOCKET_URL") }
  const collection = { token, ...user };

  return (
    <AuthProvider user={collection}>
      <SocketProvider option={data_socket}>
        <Shell user={collection} defaultOpenState={defaultOpenState}>
          {children}
        </Shell>
      </SocketProvider>
    </AuthProvider>
  );
}
