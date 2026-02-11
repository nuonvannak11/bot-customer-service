"use client";

import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  FileWarning,
  Plus,
  X,
  Save,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import Swal from "sweetalert2";
import { GroupChannel } from "@/interface/interface.telegram";
import { SetStateProps } from "@/interface";
import { TelegramProtectPageState } from "../TelegramProtectPage";
import { StatusBadge } from "./entity/StatusBadge";
import { strlower } from "@/utils/util";
import { useRouter } from "next/navigation";

type FileGuardProps = SetStateProps<TelegramProtectPageState> & {
  loading: boolean;
  handlers: {
    onSave: (asset: GroupChannel) => void;
  };
  t: (key: string) => string;
};

export default function FileGuard({
  state,
  setState,
  loading,
  handlers,
  t,
}: FileGuardProps) {
  const router = useRouter();
  const { onSave } = handlers;
  const { activeAsset } = state;
  const config = activeAsset.config;
  const isExceptionFiles = state.exceptionFiles?.length > 0;
  const isAllowNoneAdmin =
    config.blockAllExstationFromNoneAdmin && isExceptionFiles;
  const [newExt, setNewExt] = useState("");

  const updateAssetConfig = (updates: Partial<typeof config>) => {
    setState((prev) => {
      const updatedConfig = { ...prev.activeAsset.config, ...updates };
      const updatedAsset = { ...prev.activeAsset, config: updatedConfig };
      return {
        ...prev,
        activeAsset: updatedAsset,
        managedAssets: {
          ...prev.managedAssets,
          active: prev.managedAssets.active.map((asset) =>
            asset.chatId === activeAsset.chatId ? updatedAsset : asset,
          ),
        },
      };
    });
  };

  const handleAddExtension = () => {
    if (loading) return;
    if (isAllowNoneAdmin) {
      toast(t("You can't add while you allow non-admin files"), {
        icon: <AlertTriangle size={18} className="text-amber-500" />,
      });
      return;
    }
    const ext = strlower(newExt.trim());
    if (!ext) return toast.error("Extension cannot be empty");
    if (!ext.startsWith(".")) {
      return toast.error("Extension must start with a dot (.)");
    }
    const cleanedExt = (ext || "").replace(/\s+/g, "").replace(/\.+$/, "");
    const multipleExt = cleanedExt.match(/\.[^.]+/g) || [];
    if (!multipleExt) {
      return toast.error("Extension cannot be empty");
    }
    const blocked = config.blockedExtensions.map((e) => strlower(e));
    const errBlock = multipleExt.filter((ext) =>
      blocked.includes(strlower(ext)),
    );
    if (errBlock.length) {
      return toast.error(`Extensions already blocked: ${errBlock.join(", ")}`);
    }
    updateAssetConfig({
      blockedExtensions: [...config.blockedExtensions, ...multipleExt],
    });
    setNewExt("");
  };

  const handleRemoveExtension = (extToRemove: string) => {
    if (loading) return;
    if (isAllowNoneAdmin) {
      toast(t("You can't remove while you allow non-admin files"), {
        icon: <AlertTriangle size={18} className="text-amber-500" />,
        duration: 1500,
      });
      return;
    }
    updateAssetConfig({
      blockedExtensions: config.blockedExtensions.filter(
        (e) => e !== extToRemove,
      ),
    });
  };

  const handleToggleBlockFiles = async () => {
    if (!isExceptionFiles) {
      const result = await Swal.fire({
        icon: "warning",
        title: t("Whitelist required"),
        text: t(
          "You can't open this feature without adding files to whitelist.",
        ),
        showCancelButton: true,
        confirmButtonText: t("Go to whitelist"),
        cancelButtonText: t("Cancel"),
        confirmButtonColor: "#f59e0b",
      });
      if (result.isConfirmed) {
        router.push("/settings/telegram/?tab=files-whitelist");
      }
      return;
    }
    updateAssetConfig({
      blockAllExstationFromNoneAdmin: !isAllowNoneAdmin,
    });
  };

  const classInput = isAllowNoneAdmin ? "cursor-not-allowed opacity-50" : "";
  const classButton = isAllowNoneAdmin
    ? "cursor-not-allowed opacity-50"
    : "cursor-pointer";

  return (
    <div className="w-full">
      <div className="relative flex flex-col h-[480px] w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-colors duration-300">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-rose-100 dark:bg-rose-500/10 rounded-xl border border-rose-200 dark:border-rose-500/20">
              <FileWarning
                size={22}
                className="text-rose-600 dark:text-rose-400"
              />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base tracking-tight">
                {t("File Guard")}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {t("Block execution by extension")}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {config.blockedExtensions && config.blockedExtensions.length > 0 ? (
              <StatusBadge status="active" t={t} />
            ) : (
              <StatusBadge status="inactive" t={t} />
            )}
            {activeAsset.name && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                {activeAsset.name}
              </span>
            )}
          </div>
        </div>
        <div className="p-6 flex-1 space-y-6">
          <div className="flex gap-2">
            <input
              disabled={loading || isAllowNoneAdmin}
              type="text"
              value={newExt}
              onChange={(e) => setNewExt(e.target.value)}
              onKeyDown={(e) => {
                e.preventDefault();
                if (e.key === "Enter") {
                  handleAddExtension();
                }
              }}
              placeholder="e.g. .exe"
              className={`${classInput} flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm`}
            />
            <button
              disabled={loading || isAllowNoneAdmin}
              onClick={handleAddExtension}
              className={`${classButton} px-4 bg-slate-900 dark:bg-slate-800 hover:bg-rose-600 dark:hover:bg-rose-600 text-white rounded-xl flex items-center justify-center transition-colors shadow-md active:scale-95`}>
              <Plus size={20} />
            </button>
          </div>

          <div className="h-[120px] p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
            {config.blockedExtensions && config.blockedExtensions.length > 0 ? (
              <div className={`${classInput} flex flex-wrap gap-2`}>
                {config.blockedExtensions.map((ext) => (
                  <span
                    key={ext}
                    className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-lg bg-white dark:bg-rose-500/10 border border-slate-200 dark:border-rose-500/20 text-slate-700 dark:text-rose-200 text-xs font-semibold shadow-sm hover:border-rose-300 dark:hover:border-rose-500/50 transition-colors">
                    {ext}
                    <button
                      disabled={loading || isAllowNoneAdmin}
                      onClick={() => handleRemoveExtension(ext)}
                      className="p-0.5 rounded-md text-slate-400 hover:bg-rose-100 dark:hover:bg-rose-500/30 hover:text-rose-600 dark:hover:text-rose-200 transition-colors">
                      <X size={14} className={classInput} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 space-y-2 py-4">
                <ShieldCheck
                  size={32}
                  strokeWidth={1.5}
                  className="opacity-50"
                />
                <span className="text-xs">{t("No extensions blocked")}</span>
              </div>
            )}
          </div>

          <div
            onClick={() => handleToggleBlockFiles()}
            className="group cursor-pointer flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all active:scale-[0.99]">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Block Non-Admin Files
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Strict mode: Delete all files from users
              </span>
            </div>

            <div
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                isAllowNoneAdmin
                  ? "bg-rose-500"
                  : "bg-slate-300 dark:bg-slate-700"
              }`}>
              <span
                className={`absolute top-1 left-1 bg-white rounded-full w-4 h-4 shadow-sm transform transition-transform duration-200 ease-in-out ${
                  isAllowNoneAdmin ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 flex justify-between items-center">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            * Updates apply immediately
          </p>
          <button
            disabled={loading}
            onClick={() => onSave(activeAsset)}
            className="flex items-center cursor-pointer gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 px-5 rounded-lg transition-colors shadow-sm active:scale-95">
            <Save size={16} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
