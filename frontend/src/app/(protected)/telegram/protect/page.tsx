import { Suspense } from "react";
import { getProtects } from "@/libs/data";
import TelegramProtectPage from "@/components/telegram/TelegramProtectPage";
import { prepareProtectData } from "@/libs/lib";
import cryptoService from "@/libs/crypto";
import TelegramProtectSkeleton from "@/components/skeleton/TelegramProtectSkeleton";

async function TelegramProtectPageSettings() {
  const protects = await getProtects();
  const prepareData = prepareProtectData(protects);
  return <TelegramProtectPage hash_key={cryptoService.random_key()} protects={prepareData} />;
}

export default async function TelegramProtect() {
  return (
    <Suspense fallback={<TelegramProtectSkeleton />}>
      <TelegramProtectPageSettings />
    </Suspense>
  );
}