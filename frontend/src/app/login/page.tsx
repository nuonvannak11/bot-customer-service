import cryptoService from "@/libs/crypto";
import LoginRegister from "@/components/LoginRegister";
import { redirectPages } from "@/helper/helper.redirect";

export default async function LoginRegisterPage() {
  await redirectPages();
  return (
    <div className="flex p-2 items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950">
      <LoginRegister hash_data={cryptoService.random_key()} />
    </div>
  );
}
