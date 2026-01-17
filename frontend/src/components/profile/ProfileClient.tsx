"use client";

import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";

import SettingsInput from "@/components/SettingsInput";
import Toggle from "@/components/ToggleCheckBox";
import { UserProfileConfig } from "@/interface";
import { toast } from "react-hot-toast";

export default function ProfileClient({
  hash_key,
  profile,
}: {
  hash_key: string;
  profile: UserProfileConfig;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const coinRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAvatarUpdate, setIsAvatarUpdate] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState(profile);

  useEffect(() => {
    const coin = coinRef.current;
    const glow = glowRef.current;

    if (coin && glow) {
      gsap.to(coin, {
        y: -6,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });

      gsap.to(glow, {
        opacity: 0.5,
        scale: 1.1,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(coin, {
        rotationY: 15,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }

    return () => {
      gsap.killTweensOf([coin, glow]);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSave = async () => {
    const toastId = toast.loading("Saving configuration...");
    setIsLoading(true);
    try {
      const form_data = new FormData();
      if (selectedFile) {
        form_data.append("updateAvatar", selectedFile);
      }
      form_data.append("isAvatarUpdated", isAvatarUpdate.toString());
      form_data.append("avatar", formData.avatar);
      form_data.append("hash_key", hash_key);
      form_data.append("fullName", formData.fullName);
      form_data.append("username", formData.username);
      form_data.append("email", formData.email);
      form_data.append("phone", formData.phone);
      form_data.append("bio", formData.bio);
      form_data.append(
        "emailNotifications",
        formData.emailNotifications ? "1" : "0"
      );
      form_data.append("twoFactor", formData.twoFactor ? "1" : "0");

      const res = await fetch("/api/user/update-profile", {
        method: "POST",
        body: form_data
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.message, { id: toastId, duration: 1500 });
      } else if (data?.code === 200) {
        const format_two_factor = data.data.twoFactor === "1";
        const format_email_notifications = data.data.emailNotifications === "1";
        data.data.twoFactor = format_two_factor;
        data.data.emailNotifications = format_email_notifications;
        setFormData((p) => ({ ...p, ...data.data }));
        setIsAvatarUpdate(false);
        toast.success("Update successful!", { id: toastId, duration: 1500 });
      } else {
        toast.error(data?.message || "Failed to save", { id: toastId, duration: 1500 });
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to save", { id: toastId, duration: 1500 });
    }
    await new Promise((resolve) => setTimeout(resolve, 800));
    setIsLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Profile Settings</h1>
        <p className="text-slate-400 mt-2">
          Manage your account details and public profile.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden">
            <div className="relative group shrink-0">
              <div
                role="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 rounded-full p-1 bg-slate-950 border border-slate-800 shadow-[0_0_40px_rgba(6,182,212,0.6)] relative overflow-hidden cursor-pointer">
                <img
                  src={previewUrl ?? formData.avatar}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="text-white" size={24} />
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="absolute bottom-1 right-1 bg-cyan-500 text-slate-950 p-2 rounded-full hover:bg-cyan-400 transition-colors shadow-lg"
                title="Change avatar">
                <Camera size={16} />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e: any) => {
                  const file = e.target.files?.[0] ?? null;
                  if (file) {
                    setSelectedFile(file);
                    const url = URL.createObjectURL(file);
                    setPreviewUrl(url);
                    setFormData((p) => ({ ...p, avatar: url }));
                    setIsAvatarUpdate(true);
                  }
                }}
              />
            </div>

            {/* User Text Info */}
            <div className="text-center sm:text-left space-y-2">
              <h2 className="text-2xl font-bold text-white">
                {formData.fullName}
              </h2>
              <p className="text-cyan-400 font-medium">@{formData.username}</p>
              <p className="text-slate-400 text-sm max-w-sm">
                Update your photo and personal details here.
              </p>
            </div>

            {/* === POINTS BLOCK === */}
            <div className="sm:ml-auto w-full sm:w-auto">
              <div className="group bg-slate-950/80 border border-amber-500/30 p-4 rounded-xl flex items-center justify-center sm:justify-start gap-4 shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)] hover:border-amber-500/60 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02] cursor-pointer relative overflow-hidden">
                <div
                  ref={glowRef}
                  className="absolute inset-0 bg-amber-500/10 rounded-xl"
                  style={{ opacity: 0.2 }}
                />
                <div className="absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-linear-to-r from-transparent to-white opacity-20 group-hover:animate-shine pointer-events-none" />
                <div className="relative z-10 w-12 h-12 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ease-out">
                  <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full group-hover:bg-amber-500/40 transition-colors duration-300" />
                  <img
                    ref={coinRef}
                    src="https://buckets.onecontrol.store/assets/icon/reward.png"
                    alt="Reward Points"
                    className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                  />
                </div>
                <div className="relative z-10">
                  <p className="text-xs text-amber-200/70 font-bold uppercase tracking-wider group-hover:text-amber-200 transition-colors">
                    Balance
                  </p>
                  <p className="text-2xl font-bold text-white tabular-nums leading-none group-hover:text-amber-100 transition-colors">
                    {formData.points.toLocaleString()}
                    <span className="text-sm text-amber-500 ml-1 font-medium group-hover:text-amber-400">
                      pts
                    </span>
                  </p>
                </div>
              </div>
            </div>
            {/* === END POINTS BLOCK === */}
          </section>

          {/* Form Fields */}
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-4">
              <User size={20} className="text-cyan-400" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingsInput
                label="Full Name"
                value={formData.fullName}
                onChange={(v) => setFormData({ ...formData, fullName: v })}
                icon={User}
              />
              <SettingsInput
                label="Username"
                value={formData.username}
                onChange={(v) => setFormData({ ...formData, username: v })}
                icon={User}
              />
              <SettingsInput
                label="Email Address"
                value={formData.email}
                onChange={(v) => setFormData({ ...formData, email: v })}
                icon={Mail}
              />
              <SettingsInput
                label="Phone Number"
                value={formData.phone}
                onChange={(v) => setFormData({ ...formData, phone: v })}
                icon={Phone}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="group">
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">
                Bio
              </label>
              <div className="relative transition-all duration-300 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.15)] rounded-xl">
                <div className="absolute top-3 left-3 flex items-start pointer-events-none">
                  <FileText
                    size={18}
                    className="text-slate-500 group-focus-within:text-cyan-400 transition-colors"
                  />
                </div>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  placeholder="Tell us a little about yourself..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 pl-10 pr-4 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-all placeholder:text-slate-600 resize-none"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Settings */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-semibold text-slate-200 border-b border-slate-800 pb-4">
              Security & Notification
            </h2>
            <Toggle
              label="Email Notifications"
              description="Receive daily updates."
              icon={<Bell size={18} className="text-cyan-400" />}
              checked={formData.emailNotifications}
              onChange={(v) =>
                setFormData({ ...formData, emailNotifications: v })
              }
            />
            <Toggle
              label="Two-Factor Auth"
              description="Enable extra security."
              icon={<Shield size={18} className="text-emerald-400" />}
              checked={formData.twoFactor}
              onChange={(v) => setFormData({ ...formData, twoFactor: v })}
            />
          </section>

          <button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full cursor-pointer bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
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
