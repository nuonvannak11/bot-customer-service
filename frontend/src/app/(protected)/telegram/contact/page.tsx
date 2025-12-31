import { getTelegramData } from "@/libs/data";
import TelegramContactPage from "@/components/telegram/TelegramContactPage";

export default async function TelegramPage() {
  const data = await getTelegramData();
  return <TelegramContactPage data={data} />;
}