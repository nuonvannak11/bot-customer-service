import { getSettings } from "@/libs/data";
import { get_key } from "@/libs/generate_key";
import SettingsClient from "@/components/settings/SettingsClient";
import TelegramSettingsClient from "@/components/settings/TelegramSettingsClient";

export default async function SettingsTelegramPage() {
  const settings = await getSettings();
  return (
    <SettingsClient activeTab="telegram">
      <TelegramSettingsClient hash_key={get_key()} initialSettings={settings} />
    </SettingsClient>
  );
}
