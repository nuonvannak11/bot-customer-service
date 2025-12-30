import { getFacebookData } from "@/libs/data";
import FacebookClient from "@/components/facebook/FacebookClient";

export default async function FacebookPage() {
  const data = await getFacebookData();
  return <FacebookClient data={data} />;
}