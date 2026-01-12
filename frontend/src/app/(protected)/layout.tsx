import { cookies } from "next/headers";
import Shell from "@/components/layout/Shell";
import { SocketProvider } from "@/contexts/SocketContext";
import { redirect } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import { checkJwtToken } from "@/hooks/use_check_jwt";
import { get_env } from "@/libs/lib";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  const auth = await checkJwtToken(token);
  if (!auth.status) {
    redirect("/login");
  }
  const defaultOpenState: Record<string, boolean> = {
    nexus_sidebar_telegram: cookieStore.get("nexus_sidebar_telegram")?.value === "true",
  };
  const user = {
    ...auth.data!,
    token: token || "",
  };
  const get_socket_url = get_env("SOCKET_URL");
  console.log("get_socket_url=",get_socket_url);
  const data_socket = {
    ...user,
    socket_url: get_socket_url
  }
  return (
    <AuthProvider user={user}>
      <SocketProvider data={data_socket}>
        <Shell user={user} defaultOpenState={defaultOpenState}>
          {children}
        </Shell>
      </SocketProvider>
    </AuthProvider>
  );
}
