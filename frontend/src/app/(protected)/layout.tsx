import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function checkAuth() {
  const cookieStore = cookies();
  const token = cookieStore.get("access_token");

  if (!token) return false;

  // Ask Express to verify token
  const res = await fetch("https://api.yourdomain.com/auth/me", {
    headers: {
      Cookie: `access_token=${token.value}`,
    },
    cache: "no-store",
  });

  return res.ok;
}

export default async function ProtectedLayout({ children }) {
  const isAuth = await checkAuth();

  if (!isAuth) {
    redirect("/login");
  }

  return children;
}
