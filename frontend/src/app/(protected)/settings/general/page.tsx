import { getSettings } from "@/libs/data";
import SettingsClient from "@/components/settings/SettingsClient";
import GeneralSettingsClient from "@/components/settings/GeneralSettingsClient";

export default async function SettingsGeneralPage() {
  const settings = await getSettings();
  return (
    <SettingsClient activeTab="general">
      <GeneralSettingsClient initialSettings={settings} />
    </SettingsClient>
  );
}
