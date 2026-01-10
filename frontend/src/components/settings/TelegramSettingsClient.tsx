"use client";

import { useState } from "react";
import {
  Bot,
  Eye,
  EyeOff,
  Globe,
  Hash,
  Save,
  ShieldCheck,
  Zap,
  Bell,
  VolumeX,
} from "lucide-react";
import toast from "react-hot-toast";
import Toggle from "@/components/ToggleCheckBox";
import { make_schema } from "@/helper/helper";

interface TelegramConfig {
  botUsername: string;
  botToken: string;
  webhookUrl: string;
  webhookEnabled: boolean;
  notifyEnabled: boolean;
  silentMode: boolean;
}

const SettingsInput = ({
  label,
  value,
  onChange,
  icon: Icon,
  placeholder,
  type = "text",
  disabled = false,
}: {
  label: string;
  value: string;
  onChange?: (val: string) => void;
  icon?: any;
  placeholder?: string;
  type?: "text" | "password";
  disabled?: boolean;
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="group">
      <label className="text-sm font-medium text-slate-300 mb-1.5 block">
        {label}
      </label>
      <div className="relative transition-all duration-300 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.15)] rounded-xl">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon
              size={18}
              className="text-slate-500 group-focus-within:text-cyan-400 transition-colors"
            />
          </div>
        )}

        {!Icon && label === "Bot Username" && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-slate-500 text-lg">@</span>
          </div>
        )}

        <input
          disabled={disabled}
          type={isPassword && !showPassword ? "password" : "text"}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-2.5 pr-4 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 focus:outline-none transition-all placeholder:text-slate-600 
            ${Icon || label === "Bot Username" ? "pl-10" : "pl-4"} 
            ${disabled ? "cursor-not-allowed opacity-70 text-slate-400" : ""}
            ${isPassword ? "pr-10" : ""}
          `}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-white transition-colors">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default function TelegramSettingsClient({
  hash_key,
  initialSettings,
}: {
  hash_key: string;
  initialSettings?: { telegram?: Partial<TelegramConfig> };
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<TelegramConfig>({
    botUsername: initialSettings?.telegram?.botUsername ?? "",
    botToken: initialSettings?.telegram?.botToken ?? "",
    webhookUrl: initialSettings?.telegram?.webhookUrl ?? "",
    webhookEnabled: initialSettings?.telegram?.webhookEnabled ?? false,
    notifyEnabled: initialSettings?.telegram?.notifyEnabled ?? true,
    silentMode: initialSettings?.telegram?.silentMode ?? false,
  });

  const handleChange = (field: keyof TelegramConfig, value: any) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!settings.botToken) {
      toast.error("Bot Token is required");
      return;
    }
    const toastId = toast.loading("Saving configuration...");
    setIsLoading(true);

    try {
      const schema = make_schema(settings).omit(["botUsername"]).extend({
        hash_key,
      }).get();
      const response = await fetch("/api/settings/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schema),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || "Request failed");
      }

      if (result.code === 200) {
        setSettings((prev) => ({
          ...prev,
          ...result.data,
        }));
        toast.success("Saved!", { id: toastId, duration: 1500 });
      } else {
        throw new Error(result?.message || "Something went wrong");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto p-1">
      <div className="absolute -top-10 -left-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-800 bg-slate-900/50 flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
            <Bot className="text-white w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Bot Configuration
            </h3>
            <p className="text-sm text-slate-400">
              Manage your Telegram integration credentials
            </p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-5">
            <h4 className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldCheck size={14} /> Credentials
            </h4>

            <SettingsInput
              label="Bot Username"
              value={settings.botUsername}
              disabled={true}
            />

            <SettingsInput
              label="Bot Token"
              type="password"
              icon={ShieldCheck}
              value={settings.botToken}
              onChange={(v) => handleChange("botToken", v)}
              placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
            />
          </div>

          <div className="w-full h-px bg-slate-800/50" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SettingsInput
              label="Webhook URL"
              icon={Globe}
              value={settings.webhookUrl}
              onChange={(v) => handleChange("webhookUrl", v)}
              placeholder="https://api.domain.com/webhook"
            />
          </div>

          <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-5 space-y-4">
            <Toggle
              label="Enable Webhook"
              description="Receive real-time updates via webhook."
              icon={<Zap size={18} className="text-amber-400" />}
              checked={settings.webhookEnabled}
              onChange={(v) => handleChange("webhookEnabled", v)}
            />
            <div className="h-px bg-slate-800/50 w-full" />
            <Toggle
              label="Push Notifications"
              description="Send alerts when a user submits a request."
              icon={<Bell size={18} className="text-emerald-400" />}
              checked={settings.notifyEnabled}
              onChange={(v) => handleChange("notifyEnabled", v)}
            />
            <div className="h-px bg-slate-800/50 w-full" />
            <Toggle
              label="Silent Mode"
              description="Deliver messages without sound."
              icon={<VolumeX size={18} className="text-rose-400" />}
              checked={settings.silentMode}
              onChange={(v) => handleChange("silentMode", v)}
            />
          </div>

          <div className="flex pt-2">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full cursor-pointer bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
