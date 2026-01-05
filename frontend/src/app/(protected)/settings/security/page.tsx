import { getSettings } from "@/libs/data";
import SettingsClient from "@/components/settings/SettingsClient";
import SecuritySettingsClient from "@/components/settings/SecuritySettingsClient";

export default async function SettingsSecurityPage() {
  const settings = await getSettings();
  return (
    <SettingsClient activeTab="security">
      <SecuritySettingsClient initialSettings={settings} />
    </SettingsClient>
  );
}
