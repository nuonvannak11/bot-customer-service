import { Suspense } from "react";
import { cryptoService } from "@/libs/crypto";
import { defaultTelegramConfig } from "@/data/data.default";
import { ensureToken } from "@/hooks/use-redirect";
import SettingsClient from "@/components/settings/SettingsClient";
import TelegramSettingsClient from "@/components/settings/TelegramSettingsClient";
import BotSettingsSkeleton from "@/components/skeleton/BotSettingsSkeleton";
import controller_telegram from "@/controller/controller_telegram";


async function TelegramSettings() {
  const token = await ensureToken();
  let settings = await controller_telegram.get_setting_bot(token as string);
  if (!settings) settings = defaultTelegramConfig;
  return (
    <TelegramSettingsClient hash_key={cryptoService.random_key()} initialSettings={settings} />
  );
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
