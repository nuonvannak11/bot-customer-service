"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import clsx from "clsx";
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
  AlertTriangle,
  FileCode,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { TelegramBotSettingsConfig } from "@/interface/index";
import Toggle from "@/components/ui/ToggleCheckBox";
import SettingsInput from "@/components/SettingsInput";
import { getErrorMessage, strlower } from "@/utils/util";

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface Props {
  hash_key: string;
  initialSettings: TelegramBotSettingsConfig;
}

type CurrentInput = {
  file: string;
  link: string;
};

export default function TelegramSettingsClient({
  hash_key,
  initialSettings,
}: Props) {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [currentInput, setCurrentInput] = useState<CurrentInput>({
    file: "",
    link: "",
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (tab) {
      if (tab === "files-whitelist") {
        fileInputRef.current?.focus();
      }
    }
  }, [tab]);

  const [originalSettings, setOriginalSettings] =
    useState<TelegramBotSettingsConfig>(initialSettings);
  const [settings, setSettings] =
    useState<TelegramBotSettingsConfig>(initialSettings);

  const executeApiCall = useCallback(
    async <T,>(url: string, payload: object, onSuccess: (data: T) => void) => {
      if (!settings.botToken) {
        toast.error(t("Bot Token is required"));
        return;
      }
      setLoading(true);
      const toastId = toast.loading(t("Saving configuration..."));
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hash_key, ...payload }),
        });
        const result: ApiResponse<T> = await response.json();
        if (!response.ok) {
          throw new Error(result?.message || "Request failed");
        }
        if (result.code === 200) {
          toast.success(t("Saved!"), { id: toastId });
          onSuccess(result.data);
        } else {
          throw new Error(result?.message || "Server Error");
        }
      } catch (error: unknown) {
        let message = "Failed to save";
        if (error instanceof Error) {
          message = error.message;
        } else if (
          typeof error === "object" &&
          error !== null &&
          "message" in error
        ) {
          message = String((error as { message: unknown }).message);
        }
        toast.error(message, { id: toastId });
      } finally {
        setLoading(false);
      }
    },
    [hash_key, settings.botToken, t],
  );

  const handleToggleBot = async (newValue: boolean) => {
    if (loading) return;
    const method = newValue ? "open" : "close";
    const endpoint = `/api/settings/telegram/${method}-bot`;
    const payload = {
      bot_token: settings.botToken,
      method,
    };
    await executeApiCall(endpoint, payload, () => {
      const updated = { ...settings, is_process: newValue };
      setSettings(updated);
      setOriginalSettings(updated);
    });
  };

  const handleSaveSettings = async () => {
    if (loading) return;
    const payload = settings;
    if (currentInput.link.trim() || currentInput.file.trim()) {
      toast.error(t("You have unsaved input. Add it or clear it."));
      return;
    }

    if (JSON.stringify(payload) === JSON.stringify(originalSettings)) {
      toast(t("No changes to save"), {
        icon: <AlertTriangle size={18} className="text-amber-500" />,
      });
      return;
    }
    await executeApiCall<TelegramBotSettingsConfig>(
      "/api/settings/telegram",
      payload,
      (data) => {
        const newSettings = { ...settings, ...data };
        setSettings(newSettings);
        setOriginalSettings(newSettings);
      },
    );
  };

  const handleChange = (
    field: keyof TelegramBotSettingsConfig,
    value: unknown,
  ) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleAdd = (type: "link" | "file") => {
    try {
      const keyMap = {
        link: "exceptionLinks",
        file: "exceptionFiles",
      } as const;
      const listKey = keyMap[type];
      const rawValue = currentInput[type]?.trim();
      if (!rawValue) return toast.error(t("Invalid input"));
      const currentList = (settings[listKey] as string[]) || [];

      if (type === "link") {
        if (currentList.includes(rawValue)) {
          return toast.error(t("Link already exists"));
        }
        const updatedSettings = {
          ...settings,
          [listKey]: [...currentList, rawValue],
        };
        setSettings(updatedSettings);
      } else if (type === "file") {
        const ext = strlower(rawValue.trim());
        if (!ext) return toast.error("Extension cannot be empty");
        if (!ext.startsWith(".")) {
          return toast.error("Extension must start with a dot (.)");
        }
        const cleanedExt = (ext || "").replace(/\s+/g, "").replace(/\.+$/, "");
        const multipleExt = cleanedExt.match(/\.[^.]+/g) || [];
        if (!multipleExt) {
          return toast.error("Extension cannot be empty");
        }
        const blocked = currentList.map((e) => strlower(e));
        const errBlock = multipleExt.filter((ext) =>
          blocked.includes(strlower(ext)),
        );
        if (errBlock.length) {
          return toast.error(`Extensions added: ${errBlock.join(", ")}`);
        }
        const updatedSettings = {
          ...settings,
          [listKey]: [...currentList, ...multipleExt],
        };
        setSettings(updatedSettings);
      }
      setCurrentInput((prev) => ({ ...prev, [type]: "" }));
    } catch (error) {
      toast.error(getErrorMessage(error) || `Failed to add ${type}`);
    }
  };

  const handleRemove = (type: "link" | "file", value: string) => () => {
    try {
      const keyMap: Record<string, keyof typeof settings> = {
        link: "exceptionLinks",
        file: "exceptionFiles",
      };
      const key = keyMap[type];
      if (!key) return;

      const updatedSettings = {
        ...settings,
        [key]: (settings[key] as string[]).filter((item) => item !== value),
      };
      setSettings(updatedSettings);
    } catch (error) {
      toast.error(getErrorMessage(error) || `Failed to remove ${type}`);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-colors duration-300">
        <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="p-3 bg-linear-to-r from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
                <Bot className="text-white w-6 h-6" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 flex items-center justify-center">
                <div
                  className={`absolute inset-0 rounded-full transition-all duration-300 ease-in-out ${
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
                {t("Bot Configuration")}
              </h3>
              <p className="text-sm text-slate-400">
                {t("Manage your Telegram integration credentials")}
              </p>
            </div>
          </div>
          {/* Status Toggle Button */}
          <button
            disabled={loading}
            onClick={() => handleToggleBot(!settings.is_process)}
            className={clsx(
              "cursor-pointer flex items-center gap-3 px-5 py-2.5 rounded-full border text-sm font-semibold transition-all shadow-sm",
              settings.is_process
                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
                : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700",
            )}>
            <span className="relative flex h-3 w-3">
              <span
                className={clsx(
                  "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                  settings.is_process ? "bg-emerald-400" : "bg-gray-400",
                )}
              />
              <span
                className={clsx(
                  "relative inline-flex rounded-full h-3 w-3",
                  settings.is_process ? "bg-emerald-500" : "bg-gray-500",
                )}
              />
            </span>
            {settings.is_process ? t("Bot Active") : t("Bot Paused")}
          </button>
        </div>
        <div className="p-6 md:p-8 space-y-8">
          {/* 1. Credentials Section */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={16} className="text-blue-500" />
              {t("Authentication")}
            </h3>

            <div className="grid grid-cols-1 gap-6">
              <SettingsInput
                label={t("Bot Username")}
                value={settings.botUsername}
                disabled={true}
              />
              <SettingsInput
                label={t("Bot Token")}
                type="password"
                icon={ShieldCheck}
                value={settings.botToken}
                onChange={(v) => handleChange("botToken", v)}
                placeholder="123456:ABC..."
                isShowPw={true}
              />
              <SettingsInput
                label={t("Webhook URL")}
                icon={Globe}
                value={settings.webhookUrl}
                onChange={(v) => handleChange("webhookUrl", v)}
                placeholder="https://api.domain.com/webhook"
              />
            </div>
          </div>
          <div className="h-px w-full bg-gray-100 dark:bg-gray-800" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Exception Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <LinkIcon size={16} className="text-indigo-500" />
                {t("Whitelisted Links")}
              </h3>
              <div className="flex gap-2 w-full">
                <SettingsInput
                  value={currentInput.link}
                  onChange={(v) =>
                    setCurrentInput((prev) => ({
                      ...prev,
                      link: v,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAdd("link");
                    }
                  }}
                  placeholder="https://example.com"
                  className="flex-1"
                />
                <button
                  onClick={() => handleAdd("link")}
                  disabled={!currentInput.link}
                  className="h-[46px] w-[46px] flex items-center justify-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                  <Plus size={20} />
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-950/50 rounded-xl p-4 min-h-[100px] border border-gray-100 dark:border-gray-800 w-full">
                {settings.exceptionLinks?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {settings.exceptionLinks.map((link, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 shadow-sm">
                        <span className="truncate max-w-[150px]">{link}</span>
                        <button
                          onClick={handleRemove("link", link)}
                          className="text-gray-400 hover:text-red-500 transition-colors">
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center py-6">
                    {t("No whitelisted links added.")}
                  </p>
                )}
              </div>
            </div>

            {/* Exception Files */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileCode size={16} className="text-rose-500" />
                {t("Whitelisted Extensions")}
              </h3>

              <div className="flex gap-2">
                <SettingsInput
                  ref={fileInputRef}
                  value={currentInput.file}
                  onChange={(v) =>
                    setCurrentInput((prev) => ({
                      ...prev,
                      file: v,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAdd("file");
                    }
                  }}
                  placeholder=".jpg, .pdf"
                  className="flex-1"
                />
                <button
                  onClick={() => handleAdd("file")}
                  disabled={!currentInput.file}
                  className="h-[46px] w-[46px] flex items-center justify-center bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                  <Plus size={20} />
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-950/50 rounded-xl p-4 min-h-[100px] border border-gray-100 dark:border-gray-800">
                {settings.exceptionFiles?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {settings.exceptionFiles.map((file, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 shadow-sm">
                        <span className="truncate max-w-[150px]">{file}</span>
                        <button
                          onClick={handleRemove("file", file)}
                          className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors">
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center py-6">
                    {t("No extensions added.")}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="h-px w-full bg-gray-100 dark:bg-gray-800" />

          {/* 3. Toggles Section */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Zap size={16} className="text-amber-500" />
              {t("Behavior")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Note: Ensure your Toggle component handles dark mode via standard tailwind classes or context */}
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <Toggle
                  label={t("Webhook")}
                  description={t("Real-time updates")}
                  icon={<Zap size={18} className="text-amber-500" />}
                  checked={settings.webhookEnabled}
                  onChange={(v) => handleChange("webhookEnabled", v)}
                />
              </div>
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <Toggle
                  label={t("Notifications")}
                  description={t("Alert on request")}
                  icon={<Bell size={18} className="text-emerald-500" />}
                  checked={settings.notifyEnabled}
                  onChange={(v) => handleChange("notifyEnabled", v)}
                />
              </div>
              <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                <Toggle
                  label={t("Silent Mode")}
                  description={t("No sound delivery")}
                  icon={<VolumeX size={18} className="text-rose-500" />}
                  checked={settings.silentMode}
                  onChange={(v) => handleChange("silentMode", v)}
                />
              </div>
            </div>
          </div>

          {/* Save Footer */}
          <div className="pt-4">
            <button
              onClick={() => handleSaveSettings()}
              disabled={loading}
              className="cursor-pointer w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-all shadow-sm shadow-blue-500/20 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {t("Save Configuration")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
