import { getReportStats } from "@/libs/data";
import ReportsClient from "@/components/reports/ReportsClient";

export default async function ReportsPage() {
  const stats = await getReportStats();
  return <ReportsClient stats={stats} />;
}