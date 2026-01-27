"use client";

import React from "react";
import { FileWarning, Plus, X } from "lucide-react";

export interface FileGuardProps {
  contextLabel?: string;
  extensions: string[];
  newExt: string;
  onNewExtChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (ext: string) => void;
}

export default function FileGuard({
  contextLabel,
  extensions,
  newExt,
  onNewExtChange,
  onAdd,
  onRemove,
}: FileGuardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg flex flex-col">
      <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
            <FileWarning size={20} className="text-rose-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">File Guard</h3>
            <p className="text-xs text-slate-500">
              Block malicious executables
            </p>
            {contextLabel ? (
              <p className="text-[10px] text-slate-400 mt-1">
                Active: <span className="text-slate-200 font-semibold">{contextLabel}</span>
              </p>
            ) : null}
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
            value={newExt}
            onChange={(e) => onNewExtChange(e.target.value)}
            placeholder="Add extension (e.g. .apk)"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-rose-500/50 transition"
          />
          <button
            onClick={onAdd}
            className="bg-rose-600 hover:bg-rose-500 text-white px-4 rounded-lg flex items-center justify-center transition"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {extensions.map((ext) => (
            <span
              key={ext}
              className="flex items-center gap-1 pl-3 pr-2 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono group hover:bg-rose-500/20 transition cursor-default"
            >
              {ext}
              <button
                onClick={() => onRemove(ext)}
                className="p-0.5 hover:bg-rose-500/30 rounded-full transition"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>

        <p className="text-xs text-slate-500 italic mt-2">
          * All files matching these extensions will be auto-deleted.
        </p>
      </div>
    </div>
  );
}
