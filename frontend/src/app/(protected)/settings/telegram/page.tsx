import { getSettings } from "@/libs/data";
import SettingsClient from "@/components/settings/SettingsClient";
import TelegramSettingsClient from "@/components/settings/TelegramSettingsClient";

export default async function SettingsTelegramPage() {
  const settings = await getSettings();
  return (
    <SettingsClient activeTab="telegram">
      <TelegramSettingsClient initialSettings={settings} />
    </SettingsClient>
  );
}
