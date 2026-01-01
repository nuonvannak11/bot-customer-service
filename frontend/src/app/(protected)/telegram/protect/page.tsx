import { getTelegramData } from "@/libs/data";
import TelegramProtectPage from "@/components/telegram/TelegramProtectPage";

export default async function TelegramPage() {
  const data = await getTelegramData();
  return <TelegramProtectPage data={data} />;
}