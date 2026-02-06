import { Suspense } from "react";
import { getProtects } from "@/libs/data";
import TelegramProtectPage from "@/components/telegram/TelegramProtectPage";
import { prepareProtectData } from "@/libs/lib";
import { get_key } from "@/libs/generate_key";
import TelegramProtectSkeleton from "@/components/skeleton/TelegramProtectSkeleton";

async function TelegramProtectPageSettings() {
  const protects = await getProtects();
  const prepareData = prepareProtectData(protects);
  const hash_key = get_key();
  return <TelegramProtectPage hash_key={hash_key} protects={prepareData} />;
}

export default async function TelegramProtect() {
  return (
    <Suspense fallback={<TelegramProtectSkeleton />}>
      <TelegramProtectPageSettings />
    </Suspense>
  );
}