import { cookies } from "next/headers";
import Shell from "@/components/layout/Shell";
import { redirect } from "next/navigation";

// Your existing auth check logic
async function checkAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token");
  if (!token) return false;
  
  // Verify token (Mocking success for now to keep it simple)
  // const res = await fetch("...", { ... });
  // return res.ok;
  return true; 
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await checkAuth();
  if (!isAuthenticated) {
    // redirect("/login"); // Uncomment this when ready
  }

  const cookieStore = await cookies();
  const defaultOpenState: Record<string, boolean> = {};

  if (cookieStore.get("nexus_sidebar_telegram")?.value === "true") {
    defaultOpenState["nexus_sidebar_telegram"] = true;
  }

  return (
    <Shell defaultOpenState={defaultOpenState}>
      {children}
    </Shell>
  );
}