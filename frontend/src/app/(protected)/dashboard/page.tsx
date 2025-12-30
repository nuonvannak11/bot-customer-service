import { getDashboardStats } from "@/libs/data";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  const data = await getDashboardStats();
  return <DashboardClient data={data} />;
}