import SettingsClient from "@/components/settings/SettingsClient";
import IntegrationsSettingsClient from "@/components/settings/IntegrationsSettingsClient";

export default async function SettingsIntegrationsPage() {
  return (
    <SettingsClient activeTab="integrations">
      <IntegrationsSettingsClient />
    </SettingsClient>
  );
}
