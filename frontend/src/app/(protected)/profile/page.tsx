import { Suspense } from "react";
import ProfileClient from "@/components/profile/ProfileClient";
import BotSettingsSkeleton from "@/components/skeleton/BotSettingsSkeleton";
import { ensureToken } from "@/hooks/use-redirect";
import controller_user from "@/controller/controller_user";
import {cryptoService} from "@/libs/crypto";

async function SuspenseProfilePage() {
  const token = await ensureToken();
  const profile = await controller_user.get_user_profile(token as string);
  const hash_key = cryptoService.random_key();
  return <ProfileClient hash_key={hash_key} profile={profile} />;
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<BotSettingsSkeleton />}>
      <SuspenseProfilePage />
    </Suspense>
  );
}
