import OneControlLanding from "@/components/HomePage";
import controller_user from "@/controller/controller_user";
export default async function Home() {
  const res = await controller_user.get_user_data();
  return <OneControlLanding data={res} />;
}
