import { get_key } from "@/libs/generate_key";
import LoginRegister from "@/components/LoginRegister";

export default async function LoginRegisterPage() {
  return (
    <div className="flex p-2 items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950">
      <LoginRegister hash_data={get_key()} />
    </div>
  );
}
