import { getTelegramData } from "@/libs/data";
import TelegramClient from "@/components/telegram/TelegramClient";

export default async function TelegramPage() {
  const data = await getTelegramData();
  return <TelegramClient data={data} />;
}