import { getProtects } from "@/libs/data";
import TelegramProtectPage from "@/components/telegram/TelegramProtectPage";

export default async function TelegramPage() {
  const protects = await getProtects();
  return <TelegramProtectPage protects={protects} />;
}