import { getDashboardStats } from "@/libs/data";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { JWTPayload } from "@/types/auth";

export default async function DashboardPage(user: JWTPayload) {
  const data = await getDashboardStats(user);
  return <DashboardClient data={data} />;
}