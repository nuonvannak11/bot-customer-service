"use client";

import React from "react";
import { Link2Off, Plus, X } from "lucide-react";

export interface LinkSentryProps {
  domains: string[];
  newDomain: string;
  onNewDomainChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (domain: string) => void;
  globalBlacklistCount?: number;
}

export default function LinkSentry({
  domains,
  newDomain,
  onNewDomainChange,
  onAdd,
  onRemove,
  globalBlacklistCount = 1402,
}: LinkSentryProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg flex flex-col">
      <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <Link2Off size={20} className="text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Link Sentry</h3>
            <p className="text-xs text-slate-500">
              Anti-phishing & scam filter
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
            Active
          </span>
        </div>
      </div>

      <div className="p-5 flex-1 space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => onNewDomainChange(e.target.value)}
            placeholder="Add domain (e.g. scam.com)"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-amber-500/50 transition"
          />
          <button
            onClick={onAdd}
            className="bg-amber-600 hover:bg-amber-500 text-white px-4 rounded-lg flex items-center justify-center transition"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {domains.map((domain) => (
            <span
              key={domain}
              className="flex items-center gap-1 pl-3 pr-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono group hover:bg-amber-500/20 transition cursor-default"
            >
              {domain}
              <button
                onClick={() => onRemove(domain)}
                className="p-0.5 hover:bg-amber-500/30 rounded-full transition"
              >
                <X size={12} />
              </button>
            </span>
          ))}
          <span className="flex items-center gap-1 pl-3 pr-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-mono opacity-50">
            + {globalBlacklistCount.toLocaleString()} Global Blacklist
          </span>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <div className="w-8 h-4 bg-slate-700 rounded-full relative cursor-pointer">
            <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-slate-400 rounded-full" />
          </div>
          <span className="text-xs text-slate-400">
            Block ALL links from non-admins
          </span>
        </div>
      </div>
    </div>
  );
}
