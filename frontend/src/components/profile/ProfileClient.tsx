"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import gsap from "gsap";
import {
  User,
  Mail,
  Phone,
  Shield,
  Bell,
  Save,
  FileText,
  Camera,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { toast } from "react-hot-toast";

import SettingsInput from "@/components/SettingsInput";
import Toggle from "@/components/ui/ToggleCheckBox";
import { UserProfileConfig } from "@/interface";

export default function ProfileClient({
  hash_key,
  profile,
}: {
  hash_key: string;
  profile: UserProfileConfig;
}) {
  const {
    formData,
    updateField,
    isLoading,
    previewUrl,
    handleFileChange,
    submitForm,
  } = useProfileForm(profile, hash_key);

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Profile Settings</h1>
        <p className="mt-2 text-slate-400">
          Manage your account details and public profile.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <section className="relative flex flex-col items-center gap-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 p-8 sm:flex-row">
            <div className="group relative shrink-0">
              <div
                role="button"
                onClick={() => fileInputRef.current?.click()}
                className="relative h-32 w-32 cursor-pointer overflow-hidden rounded-full border border-slate-800 bg-slate-950 p-1 shadow-[0_0_40px_rgba(6,182,212,0.6)]">
                <Image
                  src={previewUrl ?? formData.avatar}
                  alt="Profile"
                  fill
                  className="rounded-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="text-white" size={24} />
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="absolute bottom-1 right-1 rounded-full bg-cyan-500 p-2 text-slate-950 shadow-lg transition-colors hover:bg-cyan-400">
                <Camera size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-white">
                {formData.fullName}
              </h2>
              <p className="font-medium text-cyan-400">@{formData.username}</p>
              <p className="max-w-sm text-sm text-slate-400">
                Update your photo and personal details here.
              </p>
            </div>

            <RewardCard points={formData.points} />
          </section>

          <section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="flex items-center gap-2 border-b border-slate-800 pb-4 text-lg font-semibold text-slate-200">
              <User size={20} className="text-cyan-400" />
              Personal Information
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <SettingsInput
                label="Full Name"
                value={formData.fullName}
                onChange={(v: string) => updateField("fullName", v)}
                icon={User}
              />
              <SettingsInput
                label="Username"
                value={formData.username}
                onChange={(v: string) => updateField("username", v)}
                icon={User}
              />
              <SettingsInput
                label="Email Address"
                value={formData.email}
                onChange={(v: string) => updateField("email", v)}
                icon={Mail}
              />
              <SettingsInput
                label="Phone Number"
                value={formData.phone}
                onChange={(v: string) => updateField("phone", v)}
                icon={Phone}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="group">
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Bio
              </label>
              <div className="relative rounded-xl transition-all duration-300 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                <div className="pointer-events-none absolute left-3 top-3 flex items-start">
                  <FileText
                    size={18}
                    className="text-slate-500 transition-colors group-focus-within:text-cyan-400"
                  />
                </div>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => updateField("bio", e.target.value)}
                  placeholder="Tell us a little about yourself..."
                  className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-10 pr-4 text-white placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>
          </section>
        </div>
        <div className="space-y-6 lg:col-span-4">
          <section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="border-b border-slate-800 pb-4 text-lg font-semibold text-slate-200">
              Security & Notification
            </h2>
            <Toggle
              label="Email Notifications"
              description="Receive daily updates."
              icon={<Bell size={18} className="text-cyan-400" />}
              checked={formData.emailNotifications}
              onChange={(v: boolean) => updateField("emailNotifications", v)}
            />
            <Toggle
              label="Two-Factor Auth"
              description="Enable extra security."
              icon={<Shield size={18} className="text-emerald-400" />}
              checked={formData.twoFactor}
              onChange={(v: boolean) => updateField("twoFactor", v)}
            />
          </section>

          <button
            onClick={submitForm}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-6 py-3 font-semibold text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:from-cyan-500 hover:to-blue-500 hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const RewardCard = ({ points }: { points: number }) => {
  const coinRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (coinRef.current && glowRef.current) {
        gsap.to(coinRef.current, {
          y: -6,
          duration: 1.5,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
        });
        gsap.to(glowRef.current, {
          opacity: 0.5,
          scale: 1.1,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
        gsap.to(coinRef.current, {
          rotationY: 15,
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="group relative flex cursor-pointer items-center justify-center gap-4 overflow-hidden rounded-xl border border-amber-500/30 bg-slate-950/80 p-4 shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:border-amber-500/60 hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] sm:ml-auto sm:justify-start">
      <div
        ref={glowRef}
        className="absolute inset-0 rounded-xl bg-amber-500/10 opacity-20"
      />
      <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />

      <div className="relative z-10 flex h-12 w-12 items-center justify-center transition-transform duration-300 group-hover:scale-110">
        <div className="absolute inset-0 blur-xl rounded-full bg-amber-500/20 transition-colors duration-300 group-hover:bg-amber-500/40" />
        <Image
          ref={coinRef}
          src="https://buckets.onecontrol.store/assets/icon/reward.png"
          alt="Reward Points"
          width={40}
          height={40}
          className="drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
        />
      </div>

      <div className="relative z-10">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-200/70 transition-colors group-hover:text-amber-200">
          Balance
        </p>
        <p className="text-2xl font-bold tabular-nums leading-none text-white transition-colors group-hover:text-amber-100">
          {points.toLocaleString()}
          <span className="ml-1 text-sm font-medium text-amber-500 group-hover:text-amber-400">
            pts
          </span>
        </p>
      </div>
    </div>
  );
};

const useProfileForm = (profile: UserProfileConfig, hash_key: string) => {
  const [formData, setFormData] = useState(profile);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const updateField = (field: keyof UserProfileConfig, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const submitForm = async () => {
    const toastId = toast.loading("Saving configuration...");
    setIsLoading(true);

    try {
      const payload = new FormData();
      if (selectedFile) payload.append("updateAvatar", selectedFile);

      payload.append("isAvatarUpdated", (!!selectedFile).toString());
      payload.append("avatar", previewUrl || formData.avatar); // Optimistic UI or fallback
      payload.append("hash_key", hash_key);

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "emailNotifications" || key === "twoFactor") {
          payload.append(key, value ? "1" : "0");
        } else if (typeof value === "string") {
          payload.append(key, value);
        }
      });

      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        body: payload,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "Failed to save");

      if (data?.code === 200) {
        const { twoFactor, emailNotifications, ...rest } = data.data;
        setFormData((prev) => ({
          ...prev,
          ...rest,
          twoFactor: twoFactor === "1",
          emailNotifications: emailNotifications === "1",
        }));
        setSelectedFile(null); // Reset file selection after upload
        toast.success("Update successful!", { id: toastId });
      } else {
        throw new Error(data?.message || "Server error");
      }
    } catch (error: unknown) {
      let message = "Failed to save";
      if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    updateField,
    isLoading,
    previewUrl,
    handleFileChange,
    submitForm,
  };
};
