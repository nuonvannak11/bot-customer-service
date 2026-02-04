"use client";

import React from "react";
import {
  Link2Off,
  Plus,
  X,
  Save,
  ShieldAlert,
} from "lucide-react";
import { LinkSentryProps } from "@/interface/telegram/interface.telegram";

export default function LinkSentry({
  contextLabel,
  domains,
  newDomain,
  onNewDomainChange,
  onAdd,
  onRemove,
  onBlockAllLinksFromNoneAdmin,
  blockAllLinksFromNoneAdmin,
  onSave = () => {},
}: LinkSentryProps) {
  const isActive = domains.length > 0 || blockAllLinksFromNoneAdmin;
  const hasData = domains.length > 0;

  return (
    <div className="w-full">
      <div className="relative flex flex-col w-full h-[480px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-colors duration-300">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-orange-100 dark:bg-orange-500/10 rounded-xl border border-orange-200 dark:border-orange-500/20">
              <Link2Off
                size={22}
                className="text-orange-600 dark:text-orange-400"
              />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base tracking-tight">
                Link Sentry
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Anti-phishing & scam filter
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {isActive ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] uppercase font-bold text-emerald-700 dark:text-emerald-400 tracking-wider">
                  Active
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100/80 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                <span className="text-[11px] uppercase font-bold text-orange-700 dark:text-orange-400 tracking-wider">
                  Inactive
                </span>
              </div>
            )}

            {contextLabel && (
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                {contextLabel}
              </span>
            )}
          </div>
        </div>

        <div className="p-6 flex-1 space-y-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => onNewDomainChange(e.target.value)}
              placeholder="Add domain (e.g. scam-site.com)"
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
            />
            <button
              onClick={onAdd}
              className="px-4 bg-slate-900 dark:bg-slate-800 hover:bg-orange-600 dark:hover:bg-orange-600 text-white rounded-xl flex items-center justify-center transition-colors shadow-md">
              <Plus size={20} />
            </button>
          </div>

          <div className="h-[120px] p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
            {hasData ? (
              <div className="flex flex-wrap gap-2">
                {domains.map((domain) => (
                  <span
                    key={domain}
                    className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-lg bg-white dark:bg-orange-500/10 border border-slate-200 dark:border-orange-500/20 text-slate-700 dark:text-orange-200 text-xs font-semibold shadow-sm hover:border-orange-300 dark:hover:border-orange-500/50 transition-colors">
                    {domain}
                    <button
                       onClick={() => onRemove(domain)}
                      className="p-0.5 rounded-md text-slate-400 hover:bg-orange-100 dark:hover:bg-orange-500/30 hover:text-orange-600 dark:hover:text-orange-200 transition-colors">
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-600 space-y-2 py-4">
                <ShieldAlert
                  size={32}
                  strokeWidth={1.5}
                  className="opacity-50"
                />
                <span className="text-xs">No domains blocked</span>
              </div>
            )}
          </div>

          <div
            onClick={() =>
              onBlockAllLinksFromNoneAdmin(!blockAllLinksFromNoneAdmin)
            }
            className="group cursor-pointer flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all active:scale-[0.99]">
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Block Non-Admin Links
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Strict mode: Delete all links from users
              </span>
            </div>
            <div
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${blockAllLinksFromNoneAdmin ? "bg-orange-500" : "bg-slate-300 dark:bg-slate-700"}`}>
              <span
                className={`absolute top-1 left-1 bg-white rounded-full w-4 h-4 shadow-sm transform transition-transform duration-200 ease-in-out ${blockAllLinksFromNoneAdmin ? "translate-x-5" : "translate-x-0"}`}
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 flex justify-between items-center">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            * Updates apply immediately
          </p>

          <button
            onClick={onSave}
            className="flex items-center cursor-pointer gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold py-2.5 px-5 rounded-lg transition-colors shadow-sm">
            <Save size={16} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
