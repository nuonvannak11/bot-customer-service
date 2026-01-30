import { get_key } from "@/libs/generate_key";
import VerifyPhone from "@/components/VerifyPhone";
import { mask_phone } from "@/libs/lib";
import { redirect } from "next/navigation";
import controller_user from "@/controller/controller_user";
import { cookies } from "next/headers";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LoginRegisterPage({ searchParams }: PageProps) {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;
    const check_auth = await controller_user.check_auth(token);
    if (check_auth.code == 200) {
      redirect("/dashboard");
    }
  
  const resolvedParams = await searchParams;
  const phone_number = resolvedParams.phone;

  return (
    <VerifyPhone
      hash_key={get_key()}
      phone_mask={mask_phone(phone_number as string)}
      phone={phone_number as string}
    />
  );
}
