import { getTelegramData } from "@/libs/data";
import TelegramGroupPage from "@/components/telegram/TelegramGroupPage";

export default async function TelegramPage() {
  const data = await getTelegramData();
  return <TelegramGroupPage data={data} />;
}