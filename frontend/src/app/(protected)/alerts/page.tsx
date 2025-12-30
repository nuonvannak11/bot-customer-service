import { getAlertRules } from "@/libs/data";
import AlertsClient from "@/components/alerts/AlertsClient";

export default async function AlertsPage() {
  const rules = await getAlertRules();
  return <AlertsClient initialRules={rules} />;
}