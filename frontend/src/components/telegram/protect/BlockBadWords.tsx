"use client";

import React, { useState, useRef, useLayoutEffect, KeyboardEvent } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  X,
  Save,
  ShieldCheck,
  AlertTriangle,
  Type,
  ListPlus,
} from "lucide-react";
import gsap from "gsap";
import { ProtectChildProps } from "@/interface/interface.telegram";

export default function BlockBadWords({
  state,
  setState,
  loading,
  handlers,
  t,
}: ProtectChildProps) {
  const [inputValue, setInputValue] = useState("");
  const inputValueRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { activeAsset } = state;
  const config = activeAsset.config;

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(containerRef);

      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
      );

      const tags = q(".word-tag");

      if (tags.length) {
        gsap.fromTo(
          tags,
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.3,
            stagger: 0.05,
            delay: 0.2,
            ease: "back.out(1.7)",
          },
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  if (!config) return null;

  const badWords = config.badWords || [];
  const isEnabled = config.blockBadWordsEnabled;

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

  const handleAddWord = () => {
    const word = inputValue.trim().toLowerCase();
    if (!word) return;
    if (badWords.includes(word)) {
      toast.error(t("Word already exists"));
      return;
    }

    const updatedAsset = {
      ...config,
      badWords: [...badWords, word],
    };

    updateAssetConfig(updatedAsset);
    setInputValue("");

    requestAnimationFrame(() => {
      gsap.fromTo(
        `[data-word="${word}"]`,
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" },
      );
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddWord();
    }
  };

  const removeWord = (wordToRemove: string) => {
    const updatedAsset = {
      ...config,
      badWords: badWords.filter((w) => w !== wordToRemove),
    };
    updateAssetConfig(updatedAsset);
  };

  const toggleFilter = (enabled: boolean) => {
    if (loading) return;
    if (badWords.length === 0) {
      toast.error("You need add words to block", { duration: 1500 });
      inputValueRef.current?.focus();
      return;
    }
    const updatedAsset = { ...config, blockBadWordsEnabled: enabled };
    updateAssetConfig(updatedAsset);
  };

  return (
    <div
      ref={containerRef}
      className="lg:col-span-2 bg-white dark:bg-slate-900 border border-zinc-200 dark:border-slate-800 rounded-2xl shadow-lg overflow-hidden flex flex-col h-full transition-colors duration-300">
      <div className="p-5 border-b border-zinc-200 dark:border-slate-800 flex justify-between items-center bg-zinc-50/80 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-200 dark:border-indigo-500/20 shadow-[0_0_15px_-3px_rgba(99,102,241,0.2)]">
            <ListPlus size={20} />
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-white text-sm">
              {t("Block Bad Words")}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-slate-500">
              {t("Filter profanity and restricted terms")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => toggleFilter(!isEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
              isEnabled ? "bg-indigo-500" : "bg-zinc-300 dark:bg-slate-700"
            }`}>
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                isEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>

          <button
            disabled={loading}
            onClick={() => handlers.onSave(activeAsset)}
            className="flex cursor-pointer items-center gap-2 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all duration-300 ease-out shadow-lg bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed">
            <Save size={14} />
            {t("Save Config")}
          </button>
        </div>
      </div>
      <div className="p-6 flex flex-col gap-6 flex-1">
        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Type
                size={18}
                className="text-zinc-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors"
              />
            </div>
            <input
              ref={inputValueRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("Type a word to block...")}
              className="w-full pl-10 pr-12 py-3 bg-zinc-100 dark:bg-slate-950/50 border border-zinc-200 dark:border-slate-800 rounded-xl text-sm text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all duration-200"
            />
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono font-medium text-zinc-400 dark:text-slate-600 bg-zinc-200/50 dark:bg-slate-800/50 rounded border border-zinc-200 dark:border-slate-700">
                ↵
              </kbd>
            </div>
          </div>

          <button
            onClick={handleAddWord}
            disabled={!inputValue.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-200 disabled:dark:bg-slate-800 disabled:text-zinc-400 disabled:dark:text-slate-600 text-white rounded-xl font-medium text-sm transition-all duration-200 shadow-sm active:scale-95">
            <Plus size={18} />
          </button>
        </div>
        <div className="flex-1 bg-zinc-50/50 dark:bg-slate-950/30 border border-dashed border-zinc-300 dark:border-slate-800 rounded-xl p-4 min-h-[200px] transition-colors relative">
          {badWords.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-40 select-none pointer-events-none">
              <div className="w-16 h-16 bg-zinc-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle
                  size={32}
                  className="text-zinc-400 dark:text-slate-500"
                />
              </div>
              <p className="text-sm font-medium text-zinc-500 dark:text-slate-400">
                {t("No restricted words yet")}
              </p>
              <p className="text-xs text-zinc-400 dark:text-slate-600 mt-1 max-w-[200px]">
                {t(
                  "Add words above to automatically block messages containing them.",
                )}
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 content-start">
              {badWords.map((word) => (
                <div
                  key={word}
                  data-word={word}
                  className="word-tag group flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 text-zinc-700 dark:text-slate-200 text-sm font-medium border border-zinc-200 dark:border-slate-700 rounded-lg shadow-sm hover:border-red-300 dark:hover:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-200">
                  <span>{word}</span>
                  <button
                    onClick={() => removeWord(word)}
                    className="p-0.5 rounded-md text-zinc-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 px-4 py-3 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-lg text-xs text-indigo-700 dark:text-indigo-300">
          <ShieldCheck size={16} className="shrink-0" />
          <span>
            {t(
              "Messages containing these words will be deleted instantly. The sender may be warned or muted based on your spam settings.",
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
