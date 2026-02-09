"use client";

import React, { useState, useEffect } from "react";
import clsx from "clsx";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { ShieldCheck, Activity, Shield, ShieldAlert, Lock } from "lucide-react";
import GroupManagement from "./protect/GroupManagement";
import FileGuard from "./protect/FileGuard";
import LinkSentry from "./protect/LinkSentry";
import SpamAegis from "./protect/SpamAegis";
import {
  GroupChannel,
  PreparedData,
} from "@/interface/telegram/interface.telegram";
import { useTranslation } from "react-i18next";
import { DEFAULT_ASSET } from "@/default/default";
import { request_sweet_alert } from "@/helper/helper";
import { getErrorMessage } from "@/utils/util";

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
    activeAsset: cleanProtects?.active?.[0] ?? DEFAULT_ASSET,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!protects) return;
    const { threatLogs: _, ...latestClean } = protects;
    setState((prev) => {
      const stillExists = latestClean.active.some(
        (a) => a.chatId === prev.activeAsset?.chatId,
      );
      return {
        managedAssets: latestClean,
        activeAsset: stillExists
          ? prev.activeAsset
          : (latestClean.active[0] ?? DEFAULT_ASSET),
      };
    });
  }, [protects]);

  const performApiCall = async (
    asset_key: string,
    payload: GroupChannel,
    signal?: AbortSignal,
  ) => {
    const response = await fetch("/api/telegram/protect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ asset_key, hash_key, asset: payload }),
      signal,
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const { code, message, data } = await response.json();
    if (code !== 200) throw new Error(message);
    return { message, data };
  };

  const handleDelete = async (payload: GroupChannel) => {
    if (loading) return;
    const confirmResult = await Swal.fire({
      title: t("Are you sure?"),
      text: `${payload.name} ${t("will be permanently deleted!")}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: t("Yes, delete it!"),
      cancelButtonText: t("Cancel"),
    });
    if (!confirmResult.isConfirmed) return;
    setLoading(true);

    try {
      const result = await request_sweet_alert(
        { title: t("Processing"), text: t("Deleting asset...") },
        async () => {
          const { message, data } = await performApiCall("delete", payload);
          setState((prev) => {
            const { managedAssets, activeAsset } = prev;
            const newActiveList = prev.managedAssets.active.filter(
              (asset) => asset.chatId !== data.chatId,
            );
            const newActiveAsset =
              activeAsset.chatId === data.chatId
                ? { ...(newActiveList[0] ?? DEFAULT_ASSET) }
                : activeAsset;

            let newGroupList = managedAssets.group;
            let newChannelList = managedAssets.channel;

            const existsInGroup = managedAssets.group.some(
              (a) => a.chatId === data.chatId,
            );
            const existsInChannel = managedAssets.channel.some(
              (a) => a.chatId === data.chatId,
            );

            if (!existsInGroup && data.type === "group") {
              newGroupList = [...managedAssets.group, data];
            }
            if (!existsInChannel && data.type === "channel") {
              newChannelList = [...managedAssets.channel, data];
            }
            return {
              ...prev,
              managedAssets: {
                ...prev.managedAssets,
                active: newActiveList,
                group: newGroupList,
                channel: newChannelList,
              },
              activeAsset: newActiveAsset,
            };
          });
          return message;
        },

        (err) => {
          throw err;
        },
      );
      if (result)
        toast.success(result, { position: "top-right", duration: 1500 });
    } catch (err) {
      toast.error(getErrorMessage(err) || "An error occurred", {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (asset_key: string, payload: GroupChannel) => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await request_sweet_alert(
        { title: t("Processing"), text: t("Saving changes...") },
        async () => {
          const { message, data } = await performApiCall(asset_key, payload);
          setState((prev) => {
            const { managedAssets, activeAsset } = prev;
            if (asset_key === "update") {
              const isActive = managedAssets.active.some(
                (a) => a.chatId === data.chatId,
              );
              const newActiveList = isActive
                ? managedAssets.active.map((a) =>
                    a.chatId === data.chatId ? { ...data } : a,
                  )
                : [...managedAssets.active, { ...data }];
              return {
                ...prev,
                managedAssets: { ...managedAssets, active: newActiveList },
                activeAsset:
                  activeAsset?.chatId === data.chatId
                    ? { ...data }
                    : activeAsset,
              };
            } else {
              const isGroup = managedAssets.group.some(
                (a) => a.chatId === data.chatId,
              );
              const isChannel = managedAssets.channel.some(
                (a) => a.chatId === data.chatId,
              );

              let newGroupList = managedAssets.group;
              let newChannelList = managedAssets.channel;
              let newActiveList = managedAssets.active;

              if (isGroup) {
                newGroupList = managedAssets.group.filter(
                  (a) => a.chatId !== data.chatId,
                );
              } else if (isChannel) {
                newChannelList = managedAssets.channel.filter(
                  (a) => a.chatId !== data.chatId,
                );
              }
              const existsInActive = newActiveList.some(
                (a) => a.chatId === data.chatId,
              );
              if (!existsInActive) {
                newActiveList = [...newActiveList, data];
              }
              return {
                ...prev,
                managedAssets: {
                  ...managedAssets,
                  group: newGroupList,
                  channel: newChannelList,
                  active: newActiveList,
                },
              };
            }
          });
          return message;
        },

        (err) => {
          throw err;
        },
      );
      if (result)
        toast.success(result, { position: "top-right", duration: 1500 });
    } catch (err) {
      toast.error(getErrorMessage(err) || "Update failed", {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

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
                  {state.activeAsset?.upTime ?? 0} days
                </span>
                <span className="flex items-center gap-1">
                  <Shield size={12} /> Rules:{" "}
                  {state.activeAsset?.config?.rulesCount ?? 0}
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
                {state.activeAsset?.threatsBlocked ?? 0}
              </p>
            </div>
            <div className="px-5 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                Safe Files
              </p>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {state.activeAsset?.safeFiles ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Management Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GroupManagement
          state={state}
          setState={setState}
          loading={loading}
          handlers={{
            onAdd: (asset) => handleUpdate("add", asset),
            onRemove: (asset) => handleDelete(asset),
            onSave: (asset) => handleUpdate("update", asset),
          }}
          t={t}
        />
        <FileGuard
          state={state}
          setState={setState}
          loading={loading}
          handlers={{
            onSave: (asset) => handleUpdate("update", asset),
          }}
          t={t}
        />
        <LinkSentry
          state={state}
          setState={setState}
          loading={loading}
          handlers={{
            onSave: (asset) => handleUpdate("update", asset),
          }}
          t={t}
        />
        <SpamAegis
          state={state}
          setState={setState}
          loading={loading}
          handlers={{
            onSave: (asset) => handleUpdate("update", asset),
          }}
          t={t}
        />
      </div>

      {/* Logs Section */}
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
