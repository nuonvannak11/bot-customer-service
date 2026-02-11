import { Suspense } from "react";
import ProfileClient from "@/components/profile/ProfileClient";
import { get_key } from "@/libs/generate_key";
import BotSettingsSkeleton from "@/components/skeleton/BotSettingsSkeleton";
import { ensureToken } from "@/hooks/use-redirect";
import { defaultUserProfileConfig } from "@/data/default/default";
import controller_user from "@/controller/controller_user";

async function SuspenseProfilePage() {
  const token = await ensureToken();
  let profile = await controller_user.get_user_profile(token as string);
  if (!profile) profile = defaultUserProfileConfig;
  const hash_key = get_key();
  return <ProfileClient hash_key={hash_key} profile={profile} />;
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<BotSettingsSkeleton />}>
      <SuspenseProfilePage />
    </Suspense>
  );
}
