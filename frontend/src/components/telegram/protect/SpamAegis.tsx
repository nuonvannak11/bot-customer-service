"use client";

import React from "react";
import { MessageSquareOff, Save } from "lucide-react";

export default function SpamAegis() {
  return (
    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
      <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <MessageSquareOff size={20} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Spam Aegis</h3>
            <p className="text-xs text-slate-500">
              Rate limiting and flood control
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-lg shadow-indigo-500/20">
          <Save size={14} /> Save Config
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-3">
          <div className="flex justify-between">
            <label className="text-sm font-medium text-slate-300">
              Message Rate Limit
            </label>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 rounded">
              5 / 3s
            </span>
          </div>
          <input
            type="range"
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <p className="text-[11px] text-slate-500">
            Max messages per user every 3 seconds.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <label className="text-sm font-medium text-slate-300">
              Duplicate Text
            </label>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 rounded">
              Strict
            </span>
          </div>
          <input
            type="range"
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <p className="text-[11px] text-slate-500">
            Block identical messages sent repeatedly.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <label className="text-sm font-medium text-slate-300">
              New User Restriction
            </label>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 rounded">
              24h
            </span>
          </div>
          <input
            type="range"
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <p className="text-[11px] text-slate-500">
            Disable media/links for new members.
          </p>
        </div>
      </div>
    </div>
  );
}
