import { getPages } from "@/libs/data";
import PagesClient from "@/components/pages/PagesClient";

export default async function PagesPage() {
  const pages = await getPages(); // SSR Fetch
  return <PagesClient initialPages={pages} />;
}