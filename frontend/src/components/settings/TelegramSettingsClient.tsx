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
import { ApiResponse } from "@/types/type";

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
  const linkInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (tab) {
      if (tab === "files-whitelist") {
        fileInputRef.current?.focus();
      }else if (tab === "links-whitelist") {
        linkInputRef.current?.focus();
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
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-linear-to-r from-cyan-500 to-blue-600 rounded-2xl blur-md opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <div className="relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden transition-all duration-300">
          <div className="px-6 py-6 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 bg-linear-to-br from-cyan-400 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/30 ring-1 ring-white/20">
                  <Bot className="text-white w-6 h-6" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 flex items-center justify-center">
                  <div
                    className={`absolute inset-0 rounded-full transition-all duration-300 ease-in-out ${
                      settings.is_process
                        ? "bg-emerald-500 blur-xs opacity-100"
                        : "bg-red-500 blur-xs opacity-100"
                    }`}
                  />
                  <div className="relative z-10 w-full h-full rounded-full overflow-hidden ring-2 ring-white dark:ring-gray-900 bg-slate-900 flex items-center justify-center">
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
                <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {t("Bot Configuration")}
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {t("Manage your Telegram integration credentials")}
                </p>
              </div>
            </div>
            <button
              disabled={loading}
              onClick={() => handleToggleBot(!settings.is_process)}
              className={clsx(
                "cursor-pointer flex items-center gap-3 px-5 py-2.5 rounded-full border text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-md active:scale-95",
                settings.is_process
                  ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 shadow-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/50"
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
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                  <ShieldCheck size={16} />
                </span>
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

            <div className="h-px w-full bg-linear-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                    <LinkIcon size={16} />
                  </span>
                  {t("Whitelisted Links")}
                </h3>
                <div className="flex gap-2 w-full group">
                  <SettingsInput
                    ref={linkInputRef}
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
                    className="flex-1 transition-all"
                  />
                  <button
                    onClick={() => handleAdd("link")}
                    disabled={!currentInput.link}
                    className="
                      cursor-pointer
                      h-[46px] w-[46px]
                      flex items-center justify-center
                      rounded-xl
                      transition-all duration-300
                      bg-white dark:bg-slate-800
                      text-indigo-600 dark:text-indigo-400
                      border border-indigo-100 dark:border-indigo-900
                      shadow-lg shadow-blue-500/10
                      hover:bg-indigo-50 dark:hover:bg-indigo-900/30
                      hover:border-indigo-300 dark:hover:border-indigo-500
                      hover:shadow-indigo-500/30
                      hover:scale-105
                      disabled:opacity-50 disabled:cursor-not-allowed
                    ">
                    <Plus size={20} />
                  </button>
                </div>
                <div className="h-[130px] overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-950/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800 w-full shadow-inner transition-colors hover:border-indigo-500/20">
                  {settings.exceptionLinks?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {settings.exceptionLinks.map((link, idx) => (
                        <span
                          key={idx}
                          className="group/tag inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200 hover:-translate-y-0.5">
                          <span className="truncate max-w-[150px]">{link}</span>
                          <button
                            onClick={handleRemove("link", link)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20">
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-6 flex flex-col items-center gap-2">
                      <span className="w-8 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center opacity-50">
                        <LinkIcon size={14} />
                      </span>
                      {t("No whitelisted links added.")}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
                    <FileCode size={16} />
                  </span>
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
                    className="
                      cursor-pointer
                      h-[46px] w-[46px]
                      flex items-center justify-center
                      rounded-xl
                      transition-all duration-300
                      bg-white dark:bg-slate-800
                      text-rose-600 dark:text-rose-400
                      border border-rose-100 dark:border-rose-900
                      shadow-lg shadow-blue-500/10
                      hover:bg-rose-50 dark:hover:bg-rose-900/30
                      hover:border-rose-300 dark:hover:border-rose-500
                      hover:shadow-rose-500/30
                      hover:scale-105
                      disabled:opacity-50 disabled:cursor-not-allowed
                    ">
                    <Plus size={20} />
                  </button>
                </div>

                <div className="h-[130px] overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-950/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800 shadow-inner transition-colors hover:border-rose-500/20">
                  {settings.exceptionFiles?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {settings.exceptionFiles.map((file, idx) => (
                        <span
                          key={idx}
                          className="group/tag inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 shadow-sm hover:shadow-md hover:border-rose-300 dark:hover:border-rose-700 transition-all duration-200 hover:-translate-y-0.5">
                          <span className="truncate max-w-[150px]">{file}</span>
                          <button
                            onClick={handleRemove("file", file)}
                            className="cursor-pointer text-gray-400 hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20">
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 text-center py-6 flex flex-col items-center gap-2">
                      <span className="w-8 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center opacity-50">
                        <FileCode size={14} />
                      </span>
                      {t("No extensions added.")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-linear-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Zap size={16} />
                </span>
                {t("Behavior")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-800 hover:border-amber-400/30 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 group">
                  <Toggle
                    label={t("Webhook")}
                    description={t("Real-time updates")}
                    icon={
                      <Zap
                        size={18}
                        className="text-amber-500 group-hover:scale-110 transition-transform"
                      />
                    }
                    checked={settings.webhookEnabled}
                    onChange={(v) => handleChange("webhookEnabled", v)}
                  />
                </div>
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-800 hover:border-emerald-400/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 group">
                  <Toggle
                    label={t("Notifications")}
                    description={t("Alert on request")}
                    icon={
                      <Bell
                        size={18}
                        className="text-emerald-500 group-hover:scale-110 transition-transform"
                      />
                    }
                    checked={settings.notifyEnabled}
                    onChange={(v) => handleChange("notifyEnabled", v)}
                  />
                </div>
                <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-800 hover:border-rose-400/30 hover:shadow-lg hover:shadow-rose-500/5 transition-all duration-300 group">
                  <Toggle
                    label={t("Silent Mode")}
                    description={t("No sound delivery")}
                    icon={
                      <VolumeX
                        size={18}
                        className="text-rose-500 group-hover:scale-110 transition-transform"
                      />
                    }
                    checked={settings.silentMode}
                    onChange={(v) => handleChange("silentMode", v)}
                  />
                </div>
              </div>
            </div>
            <div className="pt-4">
              <button
                onClick={() => handleSaveSettings()}
                disabled={loading}
                className="relative overflow-hidden group cursor-pointer w-full flex items-center justify-center gap-2 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-cyan-500/40 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-xl" />

                <div className="relative flex items-center gap-2">
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save
                      size={18}
                      className="group-hover:rotate-12 transition-transform"
                    />
                  )}
                  {t("Save Configuration")}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
