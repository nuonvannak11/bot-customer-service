"use client";

import React, { useCallback, useMemo, useRef, useLayoutEffect } from "react";
import { MessageSquareOff, Save } from "lucide-react";
import gsap from "gsap";
import {
  ProtectChildProps,
  SpamConfigState,
} from "@/interface/interface.telegram";
import { RangeInput } from "@/components/ui/RangeInput";
import { SpamSettingCard } from "./entity/SpamSettingCard";

export default function SpamAegis({
  state,
  setState,
  loading,
  handlers,
  t,
}: ProtectChildProps) {
  const { onSave } = handlers;
  const { activeAsset } = state;
  const spamConfig = activeAsset?.config?.spam;
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
      );
      gsap.fromTo(
        ".spam-card",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, delay: 0.2 },
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const handleConfigChange = useCallback(
    (key: keyof SpamConfigState, value: number) => {
      setState((prev) => {
        if (!prev.activeAsset || !prev.activeAsset.config) return prev;
        const updatedSpam = { ...prev.activeAsset.config.spam, [key]: value };
        const updatedConfig = { ...prev.activeAsset.config, spam: updatedSpam };
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
    },
    [setState, activeAsset.chatId],
  );

  const duplicateLabels = useMemo(
    () => ["Off", "Lenient", "Standard", "Strict"],
    [],
  );

  const restrictionLabels = useMemo(
    () => ["None", "10 Min", "1 Hour", "24 Hours", "1 Week"],
    [],
  );
  const isChanel = useMemo(
    () => activeAsset.type && activeAsset.type.includes("channel"),
    [activeAsset],
  );
  if (!spamConfig) {
    return (
      <div className="p-8 text-slate-500 text-center">
        No configuration available
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]">
            <MessageSquareOff size={20} className="text-indigo-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Spam Aegis</h3>
            <p className="text-xs text-slate-500">
              Rate limiting & flood control
            </p>
            {activeAsset.name && (
              <p className="text-[10px] text-slate-400 mt-1">
                Active:{" "}
                <span className="text-slate-200 font-semibold">
                  {activeAsset.name}
                </span>
              </p>
            )}
          </div>
        </div>

        <button
          disabled={loading}
          onClick={() => onSave(activeAsset)}
          className="flex cursor-pointer items-center gap-2 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all duration-300 ease-out shadow-lg bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-95">
          <Save size={14} />
          {t("Save Config")}
        </button>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <SpamSettingCard
          label="Message Rate"
          valueDisplay={
            spamConfig.rateLimit === 0
              ? "Off"
              : `${Math.round(spamConfig.rateLimit)} / 3s`
          }
          isActive={spamConfig.rateLimit > 0}>
          <RangeInput
            min={0}
            max={20}
            step={1}
            disabled={isChanel || loading}
            value={spamConfig.rateLimit}
            onChange={(e) =>
              handleConfigChange("rateLimit", parseFloat(e.target.value))
            }
          />
        </SpamSettingCard>

        <SpamSettingCard
          label="Duplicate Sensitivity"
          valueDisplay={
            duplicateLabels[Math.round(spamConfig.duplicateSensitivity)] ||
            "Custom"
          }
          isActive={Math.round(spamConfig.duplicateSensitivity) > 0}>
          <RangeInput
            min={0}
            max={3}
            step={1}
            disabled={isChanel || loading}
            value={spamConfig.duplicateSensitivity}
            onChange={(e) =>
              handleConfigChange(
                "duplicateSensitivity",
                parseFloat(e.target.value),
              )
            }
          />
        </SpamSettingCard>

        <SpamSettingCard
          label="New User Mute"
          valueDisplay={
            restrictionLabels[Math.round(spamConfig.newUserRestriction)] ||
            "Custom"
          }
          isActive={Math.round(spamConfig.newUserRestriction) > 0}>
          <RangeInput
            min={0}
            max={4}
            step={1}
            disabled={isChanel || loading}
            value={spamConfig.newUserRestriction}
            onChange={(e) =>
              handleConfigChange(
                "newUserRestriction",
                parseFloat(e.target.value),
              )
            }
          />
        </SpamSettingCard>
      </div>
    </div>
  );
}
