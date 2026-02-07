import { getServerToken } from "@/libs/lib";
import { redirect } from "next/navigation";

export async function ensureToken(): Promise<void | string>{
  const token = await getServerToken();
  if (!token) redirect("/login");
  return token;
}