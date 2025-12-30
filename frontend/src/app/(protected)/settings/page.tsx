import { getSettings } from "@/libs/data";
import SettingsClient from "@/components/settings/SettingsClient";

export default async function SettingsPage() {
  // Fetch sensitive data here on the server
  const settings = await getSettings();
  
  return <SettingsClient initialSettings={settings} />;
}