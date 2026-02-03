import { cookies } from "next/headers";
import { SocketProvider } from "@/contexts/SocketContext";
import { redirect } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import { get_env } from "@/libs/lib";
import Shell from "@/components/layout/Shell";
import { redirectLogin } from "@/helper/helper.redirect";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const check_token = await redirectLogin();
  if (!check_token) {
    redirect("/login");
  }
  const { token, data } = check_token;
  const defaultOpenState: Record<string, boolean> = {
    nexus_sidebar_telegram: cookieStore.get("nexus_sidebar_telegram")?.value === "true",
  };
  const data_socket = { token, socket_url: get_env("SOCKET_URL") }
  const collection = { token, ...data };

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
