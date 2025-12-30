import { getUserProfile } from "@/libs/data";
import ProfileClient from "@/components/profile/ProfileClient";

export default async function ProfilePage() {
  const profile = await getUserProfile();
  return <ProfileClient profile={profile} />;
}