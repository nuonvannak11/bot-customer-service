"use client";

import React, { useState } from "react";
import Image from "next/image";

import {
  Bot,
  Globe,
  Save,
  ShieldCheck,
  Zap,
  Bell,
  VolumeX,
  Link as LinkIcon,
  Plus,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import Toggle from "@/components/ToggleCheckBox";
import SettingsInput from "@/components/SettingsInput";
import { TelegramBotSettingsConfig } from "@/interface/index";
import { useTranslation } from "react-i18next";

export default function TelegramSettingsClient({
  hash_key,
  initialSettings,
}: {
  hash_key: string;
  initialSettings: TelegramBotSettingsConfig;
}) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [currentLinkInput, setCurrentLinkInput] = useState("");
  const [originalSettings, setOriginalSettings] =
    useState<TelegramBotSettingsConfig>(initialSettings);
  const [settings, setSettings] =
    useState<TelegramBotSettingsConfig>(initialSettings);

  const handleChange = async (
    field: keyof TelegramBotSettingsConfig,
    value: any,
  ) => {
    if (field === "is_process") {
      await handleOpenCloseBot(settings.is_process ? "close" : "open");
    } else {
      setSettings((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleAddLink = () => {
    if (!currentLinkInput.trim()) return;
    if (settings.exceptionLinks.includes(currentLinkInput.trim())) {
      toast.error("Link already exists");
      return;
    }
    const updated = {
      ...settings,
      exceptionLinks: [...settings.exceptionLinks, currentLinkInput.trim()],
    };
    handleSubmit(updated, "add_link");
  };

  const handleRemoveLink = async (linkToRemove: string) => {
    const updated = {
      ...settings,
      exceptionLinks: settings.exceptionLinks.filter(
        (link) => link !== linkToRemove,
      ),
    };
    setSettings(updated);
    handleSubmit(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddLink();
    }
  };

  const handleOpenCloseBot = async (method: string) => {
    if (!settings.botToken) {
      toast.error("Bot Token is required", {
        duration: 1500,
      });
      return;
    }
    const toastId = toast.loading("Saving configuration...");
    try {
      const response = await fetch(
        "/api/settings/telegram/" + method + "-bot",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hash_key,
            bot_token: settings.botToken,
            method
          }),
        },
      );
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.message || "Request failed");
      }
      if (result.code === 200) {
        setSettings((prev) => ({
          ...prev,
          is_process: method === "open" ? true : false,
        }));
        setOriginalSettings((prev) => ({
          ...prev,
          is_process: method === "open" ? true : false,
        }));
        toast.success("Saved!", { id: toastId, duration: 1500 });
      } else {
        toast.error(result?.message || "Something went wrong", {
          id: toastId,
          duration: 1500,
        });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save", {
        id: toastId,
        duration: 1500,
      });
    }
  };

  const handleSubmit = async (
    overrideData?: TelegramBotSettingsConfig,
    key?: string,
  ) => {
    const payload = overrideData ?? settings;
    if (!payload.botToken) {
      toast.error("Bot Token is required");
      return;
    }
    if (!key && currentLinkInput.trim()) {
      toast.error(
        "You have unsaved link input. Please add it or clear the input before saving.",
      );
      return;
    }
    if (JSON.stringify(payload) === JSON.stringify(originalSettings)) {
      toast("No changes to save", {
        icon: "⚠️",
      });
      return;
    }
    const toastId = toast.loading("Saving configuration...");
    setIsLoading(true);
    try {
      const response = await fetch("/api/settings/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hash_key, ...payload }),
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
        setOriginalSettings((prev) => ({
          ...prev,
          ...result.data,
        }));
        toast.success("Saved!", { id: toastId, duration: 1500 });
      } else {
        toast.error(result?.message || "Something went wrong", {
          id: toastId,
          duration: 1500,
        });
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save", {
        id: toastId,
        duration: 1500,
      });
    } finally {
      if (key === "add_link") {
        setCurrentLinkInput("");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto p-1">
      <div className="absolute -top-10 -left-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 bg-linear-to-r from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
                <Bot className="text-white w-6 h-6" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 flex items-center justify-center">
                <div
                  className={`
                absolute inset-0 rounded-full 
                transition-all duration-300 ease-in-out
                ${
                  settings.is_process
                    ? "bg-green-500 blur-[6px] opacity-80"
                    : "bg-red-500 blur-[6px] opacity-80"
                }
              `}
                />
                <div className="relative z-10 w-full h-full rounded-full overflow-hidden ring-2 ring-slate-900 bg-slate-900 flex items-center justify-center">
                  <Image
                    src={
                      settings.is_process
                        ? "/icon/gif/running.gif"
                        : "/icon/gif/closed.gif"
                    }
                    alt={settings.is_process ? "running" : "disabled"}
                    width={25}
                    height={25}
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
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
          <button
            onClick={() => handleChange("is_process", !settings.is_process)}
            className={`group cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl border transition-all
            ${
              settings.is_process
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-300"
            }
          `}>
            {settings.is_process ? (
              <React.Fragment>
                <Zap
                  size={16}
                  className="animate-pulse group-hover:scale-110 transition-transform"
                />
                <span className="text-sm font-medium">Running</span>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <ShieldCheck size={16} />
                <span className="text-sm font-medium">Disabled</span>
              </React.Fragment>
            )}
          </button>
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

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-cyan-500 uppercase tracking-widest flex items-center gap-2">
              <LinkIcon size={14} /> Exception Links
            </h4>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={currentLinkInput}
                  onChange={(e) => setCurrentLinkInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="https://example.com/ignore-this"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-sm rounded-xl px-4 py-3 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-600"
                />
              </div>
              <button
                onClick={handleAddLink}
                disabled={!currentLinkInput}
                className="bg-slate-800 hover:bg-cyan-600 text-cyan-400 hover:text-white border border-slate-700 hover:border-cyan-500 rounded-xl px-4 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed group">
                <Plus
                  size={20}
                  className="group-active:scale-90 transition-transform"
                />
              </button>
            </div>

            {settings.exceptionLinks && settings.exceptionLinks.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-2">
                {settings.exceptionLinks.map((link, index) => (
                  <div
                    key={index}
                    className="group flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 hover:border-rose-500/30 hover:bg-rose-500/5 rounded-lg pl-3 pr-1 py-1.5 transition-all duration-200">
                    <span className="text-xs text-slate-300 font-medium truncate max-w-[200px]">
                      {link}
                    </span>
                    <button
                      onClick={() => handleRemoveLink(link)}
                      className="p-1 rounded-md text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove link">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-600 italic px-1">
                No exception links added yet.
              </div>
            )}
          </div>
          <div className="w-full h-px bg-slate-800/50" />
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
              onClick={() => handleSubmit()}
              disabled={isLoading}
              className="w-full cursor-pointer bg-linear-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 px-6 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? (
                <React.Fragment>
                  <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                  <span>Saving...</span>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <Save size={18} />
                  <span>Save</span>
                </React.Fragment>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
