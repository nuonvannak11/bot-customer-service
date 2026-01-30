import { get_key } from "@/libs/generate_key";
import LoginRegister from "@/components/LoginRegister";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import controller_user from "@/controller/controller_user";

export default async function LoginRegisterPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;
  const check_auth = await controller_user.check_auth(token);
  if (check_auth.code == 200) {
    redirect("/dashboard");
  }
  return (
    <div className="flex p-2 items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950">
      <LoginRegister hash_data={get_key()} />
    </div>
  );
}
