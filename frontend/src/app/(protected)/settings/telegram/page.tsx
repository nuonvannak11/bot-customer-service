import { Suspense } from "react";
import { getBotSettings } from "@/libs/data";
import { get_key } from "@/libs/generate_key";
import SettingsClient from "@/components/settings/SettingsClient";
import TelegramSettingsClient from "@/components/settings/TelegramSettingsClient";
import BotSettingsSkeleton from "@/components/skeleton/BotSettingsSkeleton";

async function TelegramSettings() {
  const settings = await getBotSettings();
  const hash_key = get_key();
  return <TelegramSettingsClient hash_key={hash_key} initialSettings={settings} />;
}

export default function SettingsTelegramPage() {
  return (
    <SettingsClient activeTab="telegram">
      <Suspense fallback={<BotSettingsSkeleton />}>
        <TelegramSettings />
      </Suspense>
    </SettingsClient>
  );
}
