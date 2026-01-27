"use client";

import React, { useState } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Lock,
} from "lucide-react";
import clsx from "clsx";
import GroupManagement from "./protect/GroupManagement";
import {
  FileGuard,
  LinkSentry,
  SpamAegis,
  useTelegramProtect,
} from "./protect";

export default function TelegramProtectPage({ protects }: { protects: string[] }) {
  const {
    managedAssets,
    activeAssetId,
    activeAsset,
    setActiveAssetId,
    addManagedAsset,
    removeManagedAsset,
    blockedExtensions,
    newExt,
    setNewExt,
    addExtension,
    removeExtension,
    blacklistedDomains,
    newDomain,
    setNewDomain,
    addDomain,
    removeDomain,
    rulesCount,
  } = useTelegramProtect();

  const threatLogs = [
    {
      id: 1,
      user: "BadGuy_99",
      type: "File",
      content: "free_nitro.exe",
      action: "Blocked",
      time: "10:42 AM",
    },
    {
      id: 2,
      user: "SpamBot_X",
      type: "Link",
      content: "http://click-me.sus",
      action: "Blocked",
      time: "10:35 AM",
    },
    {
      id: 3,
      user: "Unknown",
      type: "Spam",
      content: "Buy Crypto!!! Buy Crypto!!!",
      action: "Muted (1h)",
      time: "09:12 AM",
    },
    {
      id: 4,
      user: "ScriptKiddie",
      type: "Injection",
      content: "<script>alert('hack')</script>",
      action: "Ban",
      time: "Yesterday",
    },
  ];

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
                  <Activity size={12} /> Uptime: 99.9%
                </span>
                <span className="flex items-center gap-1">
                  <Shield size={12} /> Rules: {rulesCount}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className="px-5 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                Threats Blocked
              </p>
              <p className="text-2xl font-black text-rose-400 mt-1">1,204</p>
            </div>
            <div className="px-5 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                Safe Files
              </p>
              <p className="text-2xl font-black text-emerald-400 mt-1">84.2k</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CONFIGURATION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GroupManagement
          managedAssets={managedAssets}
          activeId={activeAssetId}
          onSelect={setActiveAssetId}
          onAdd={addManagedAsset}
          onRemove={removeManagedAsset}
        />
        <FileGuard
          contextLabel={activeAsset ? `${activeAsset.name} (${activeAsset.type})` : undefined}
          extensions={blockedExtensions}
          newExt={newExt}
          onNewExtChange={setNewExt}
          onAdd={addExtension}
          onRemove={removeExtension}
        />

        <LinkSentry
          contextLabel={activeAsset ? `${activeAsset.name} (${activeAsset.type})` : undefined}
          domains={blacklistedDomains}
          newDomain={newDomain}
          onNewDomainChange={setNewDomain}
          onAdd={addDomain}
          onRemove={removeDomain}
        />

        <SpamAegis contextLabel={activeAsset ? `${activeAsset.name} (${activeAsset.type})` : undefined} />
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white flex items-center gap-2">
            <ShieldAlert size={18} className="text-rose-500" /> Security Logs
          </h3>
          <button className="text-xs text-slate-500 hover:text-white transition">
            View All
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
              {threatLogs.map((log) => (
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    
    </div>
  );
}
