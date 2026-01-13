import { getUserProfile } from "@/libs/data";
import ProfileClient from "@/components/profile/ProfileClient";
import { get_key } from "@/libs/generate_key";

export default async function ProfilePage() {
  const profile = await getUserProfile();
  return <ProfileClient hash_key={get_key()} profile={profile} />;
}
