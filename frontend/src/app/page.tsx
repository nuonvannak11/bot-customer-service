import OneControlLanding from "@/components/HomePage";
import controller_user from "@/controller/controller_user";
import { ensureValidToken } from "@/libs/lib";

export default async function Home() {
  const token = await ensureValidToken();
  const userData = token ? await controller_user.check_auth(token) : null;

  return <OneControlLanding data={userData} />;
}