import { cookies } from "next/headers";
import { SocketProvider } from "@/contexts/SocketContext";
import { redirect } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import { checkJwtToken } from "@/hooks/use_check_jwt";
import { get_env } from "@/libs/lib";
import controller_user from "@/controller/controller_user";
import Shell from "@/components/layout/Shell";
import { UserProfileConfig } from "@/interface";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  const auth = await checkJwtToken(token);
  const check_auth = await controller_user.check_auth(token);
  if (check_auth.code !== 200) {
    redirect("/login");
  }
  const defaultOpenState: Record<string, boolean> = {
    nexus_sidebar_telegram: cookieStore.get("nexus_sidebar_telegram")?.value === "true",
  };
  const user = { ...auth.data!, token: token || "" };
  const get_socket_url = get_env("SOCKET_URL");
  const data_socket = { ...user, socket_url: get_socket_url }
  const collection = { ...user, ...check_auth.data } as unknown as UserProfileConfig;
  
  return (
    <AuthProvider user={user}>
      <SocketProvider data={data_socket}>
        <Shell user={collection} defaultOpenState={defaultOpenState}>
          {children}
        </Shell>
      </SocketProvider>
    </AuthProvider>
  );
}
