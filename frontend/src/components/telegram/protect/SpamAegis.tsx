"use client";

import React, { useState, useEffect } from "react";
import { MessageSquareOff, Save, CheckCircle2 } from "lucide-react";
import { SpamAegisProps, SpamConfigState, TransformedConfig } from "@/interface/telegram/interface.telegram";
import gsap from "gsap";
import { RangeInput } from "@/components/ui/RangeInput"; 

export default function SpamAegis({ contextLabel, initialData, onSave }: SpamAegisProps) {
  const [isSaved, setIsSaved] = useState(false);

  const [config, setConfig] = useState<SpamConfigState>({
    rateLimit: 5,
    duplicateSensitivity: 3,
    newUserRestriction: 3,
  });

  useEffect(() => {
    if (initialData) {
      const ctx = gsap.context(() => {
        const animateProp = (targetVal: number, key: keyof SpamConfigState) => {
          const proxy = { val: 0 };
          gsap.to(proxy, {
            val: targetVal,
            duration: 1.5,
            ease: "power2.out",
            onUpdate: () => setConfig((prev) => ({ ...prev, [key]: proxy.val })),
          });
        };

        animateProp(initialData.rateLimit, "rateLimit");
        animateProp(initialData.duplicateSensitivity, "duplicateSensitivity");
        animateProp(initialData.newUserRestriction, "newUserRestriction");
      });
      return () => ctx.revert();
    }
  }, [initialData]);

  const duplicateLabels = ["Off", "Lenient", "Standard", "Strict"];
  const restrictionLabels = ["None", "10 Min", "1 Hour", "24 Hours", "1 Week"];

  const handleSave = () => {
    const payload: TransformedConfig = {
      rateLimit: Math.round(config.rateLimit),
      duplicateSensitivity: duplicateLabels[Math.round(config.duplicateSensitivity)],
      newUserRestriction: restrictionLabels[Math.round(config.newUserRestriction)],
    };

    if (onSave) onSave(payload);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden flex flex-col h-full">
      
      {/* Header */}
      <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]">
            <MessageSquareOff size={20} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Spam Aegis</h3>
            <p className="text-xs text-slate-500">Rate limiting & flood control</p>
            {contextLabel && (
              <p className="text-[10px] text-slate-400 mt-1">
                Active: <span className="text-slate-200 font-semibold animate-pulse">{contextLabel}</span>
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`flex items-center gap-2 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all duration-300 ease-out shadow-lg ${
            isSaved
              ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/40 translate-y-0.5"
              : "bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/40 hover:-translate-y-0.5"
          }`}
        >
          {isSaved ? <CheckCircle2 size={14} /> : <Save size={14} />}
          {isSaved ? "Saved!" : "Save Config"}
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4 group">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-300 transition-colors group-hover:text-white">
              Message Rate
            </label>
            <span className="text-xs font-bold text-indigo-300 bg-indigo-500/20 border border-indigo-500/20 px-2 py-0.5 rounded shadow-[0_0_10px_-4px_rgba(99,102,241,0.5)] transition-all">
              {Math.round(config.rateLimit)} / 3s
            </span>
          </div>
          <div className="relative h-6 flex items-center">
            <RangeInput
              min={1}
              max={20}
              step={0.01}
              value={config.rateLimit}
              onChange={(e) => setConfig({ ...config, rateLimit: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className="space-y-4 group">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-300 transition-colors group-hover:text-white">
              Duplicate Check
            </label>
            <span className={`text-xs font-bold px-2 py-0.5 rounded border transition-all duration-300 ${
                Math.round(config.duplicateSensitivity) === 0 
                ? "text-slate-400 bg-slate-800 border-slate-700" 
                : "text-indigo-300 bg-indigo-500/20 border-indigo-500/20 shadow-[0_0_10px_-4px_rgba(99,102,241,0.5)]"
            }`}>
              {duplicateLabels[Math.round(config.duplicateSensitivity)] || "..."}
            </span>
          </div>
          <div className="relative h-6 flex items-center">
            <RangeInput
              min={0}
              max={3}
              step={0.01}
              value={config.duplicateSensitivity}
              onChange={(e) => setConfig({ ...config, duplicateSensitivity: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className="space-y-4 group">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-slate-300 transition-colors group-hover:text-white">
              New User Mute
            </label>
            <span className={`text-xs font-bold px-2 py-0.5 rounded border transition-all duration-300 ${
                Math.round(config.newUserRestriction) === 0 
                ? "text-slate-400 bg-slate-800 border-slate-700" 
                : "text-indigo-300 bg-indigo-500/20 border-indigo-500/20 shadow-[0_0_10px_-4px_rgba(99,102,241,0.5)]"
            }`}>
              {restrictionLabels[Math.round(config.newUserRestriction)] || "..."}
            </span>
          </div>
          <div className="relative h-6 flex items-center">
            <RangeInput
              min={0}
              max={4}
              step={0.01}
              value={config.newUserRestriction}
              onChange={(e) => setConfig({ ...config, newUserRestriction: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}