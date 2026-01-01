import { getTelegramData } from "@/libs/data";
import TelegramChanelPage from "@/components/telegram/TelegramChanelPage";

export default async function TelegramPage() {
  const data = await getTelegramData();
  return <TelegramChanelPage data={data} />;
}