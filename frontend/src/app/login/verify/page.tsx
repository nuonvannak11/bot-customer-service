import cryptoService from "@/libs/crypto";
import VerifyPhone from "@/components/VerifyPhone";
import { mask_phone } from "@/libs/lib";
import { redirectPages } from "@/helper/helper.redirect";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LoginRegisterPage({ searchParams }: PageProps) {
  await redirectPages();
  const resolvedParams = await searchParams;
  const phone_number = resolvedParams.phone;

  return (
    <VerifyPhone
      hash_key={cryptoService.random_key()}
      phone_mask={mask_phone(phone_number as string)}
      phone={phone_number as string}
    />
  );
}
