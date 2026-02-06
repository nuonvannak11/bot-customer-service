"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, Activity, Shield, ShieldAlert, Lock } from "lucide-react";
import GroupManagement from "./protect/GroupManagement";
import FileGuard from "./protect/FileGuard";
import LinkSentry from "./protect/LinkSentry";
import SpamAegis from "./protect/SpamAegis";
import clsx from "clsx";
import {
  GroupChannel,
  PreparedData,
} from "@/interface/telegram/interface.telegram";
import { useTranslation } from "react-i18next";
import { DEFAULT_ASSET } from "@/default/default";

type TelegramProtectPageProps = {
  protects: PreparedData;
  hash_key: string;
};

export interface TelegramProtectPageState {
  managedAssets: Omit<PreparedData, "threatLogs">;
  activeAsset: GroupChannel;
}

export default function TelegramProtectPage({
  protects,
  hash_key,
}: TelegramProtectPageProps) {
  const { threatLogs, ...cleanProtects } = protects;
  const { t } = useTranslation();
  const [state, setState] = useState<TelegramProtectPageState>({
    managedAssets: cleanProtects,
    activeAsset: cleanProtects?.active[0] ?? DEFAULT_ASSET,
  });
  const [loading, setLoading] = useState(false);

  async function handledSubmit(asset_key: string, payload: GroupChannel) {
    const body = JSON.stringify({
      asset_key,
      hash_key,
      asset: payload,
    });
    const res = await fetch("/api/telegram/save-protect-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    console.log("Response from save-protect-settings:", res);
  }

  return (
    <div className="space-y-6 p-2 lg:p-0">
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 lg:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-emerald-500/30 rounded-full blur animate-pulse"></div>
              <div className="relative w-20 h-20 bg-slate-950 border-2 border-emerald-500/50 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <ShieldCheck size={40} className="text-emerald-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                System Secured
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Real-time protection is{" "}
                <span className="text-emerald-400 font-bold">ACTIVE</span>
              </p>
              <div className="flex gap-4 mt-3 text-xs font-mono text-slate-500">
                <span className="flex items-center gap-1">
                  <Activity size={12} />
                  {state.activeAsset?.upTime || 0} days
                </span>
                <span className="flex items-center gap-1">
                  <Shield size={12} /> Rules:{" "}
                  {state.activeAsset?.config?.rulesCount || 0}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="px-5 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                Threats Blocked
              </p>
              <p className="text-2xl font-black text-rose-400 mt-1">
                {state.activeAsset?.threatsBlocked}
              </p>
            </div>
            <div className="px-5 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                Safe Files
              </p>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {state.activeAsset?.safeFiles}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GroupManagement
          state={state}
          setState={setState}
          handlers={{
            onAdd: (asset) => {
              handledSubmit("add-protect", asset);
            },
            onRemove: (asset) => {
              console.log("Removing Asset from Group Management:", asset);
            },
            onSave: (asset) => {
              console.log("Saving Group Management settings for Asset:", asset);
            },
          }}
          t={t}
        />
        <FileGuard
          state={state}
          setState={setState}
          handlers={{
            onSave: (asset) => {
              console.log("Saving Group Management settings for Asset:", asset);
            },
          }}
          t={t}
        />
        <LinkSentry
          state={state}
          setState={setState}
          handlers={{
            onSave: (asset) => {
              console.log("Saving Group Management settings for Asset:", asset);
            },
          }}
          t={t}
        />
        <SpamAegis
          state={state}
          setState={setState}
          handlers={{
            onSave: (asset) => {
              console.log("Saving Group Management settings for Asset:", asset);
            },
          }}
          t={t}
        />
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white flex items-center gap-2">
            <ShieldAlert size={18} className="text-rose-500" /> Security Logs
          </h3>
          <button className="text-xs text-slate-500 hover:text-white transition">
            {t("View All")}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-950 text-slate-500 font-medium border-b border-slate-800">
              <tr>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Threat Type</th>
                <th className="px-6 py-3">Content</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {protects.threatLogs?.length ? (
                protects.threatLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {log.time}
                    </td>

                    <td className="px-6 py-4 font-medium text-white">
                      {log.user}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={clsx(
                          "px-2 py-1 rounded text-xs font-bold border",
                          log.type === "File" &&
                            "bg-rose-500/10 border-rose-500/20 text-rose-400",
                          log.type === "Link" &&
                            "bg-amber-500/10 border-amber-500/20 text-amber-400",
                          log.type === "Spam" &&
                            "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
                          log.type === "Injection" &&
                            "bg-red-600/10 border-red-600/20 text-red-500",
                        )}>
                        {log.type}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs text-slate-400 truncate max-w-[200px]">
                      {log.content}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span className="flex items-center justify-end gap-1 text-emerald-400 text-xs font-bold">
                        <Lock size={12} /> {log.action}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-slate-500 italic">
                    {t("No records found")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
