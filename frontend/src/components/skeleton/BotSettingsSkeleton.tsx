import React from "react";

const BotSettingsSkeleton = () => {
  return (
    <div className="relative w-full max-w-2xl mx-auto p-1 animate-pulse">
      <div className="absolute -top-10 -left-10 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-10 w-64 h-64 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative bg-white dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-300 dark:bg-slate-700 ring-2 ring-white dark:ring-slate-900" />
            </div>
            <div className="space-y-2">
              <div className="h-5 w-40 bg-slate-300 dark:bg-slate-700 rounded-md" />{" "}
              <div className="h-3 w-56 bg-slate-200 dark:bg-slate-800 rounded-md" />{" "}
            </div>
          </div>
          <div className="h-9 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
        <div className="p-8 space-y-8">
          <div className="space-y-5">
            <div className="h-3 w-28 bg-slate-300 dark:bg-slate-700 rounded-md mb-4" />
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />{" "}
              <div className="h-12 w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl" />{" "}
            </div>
            <div className="space-y-2">
              <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />{" "}
              <div className="h-12 w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl" />{" "}
            </div>
          </div>
          <div className="w-full h-px bg-slate-200 dark:bg-slate-800/50" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-12 w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-3 w-32 bg-slate-300 dark:bg-slate-700 rounded-md" />
            <div className="flex gap-2">
              <div className="h-12 flex-1 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl" />
              <div className="h-12 w-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <div className="h-8 w-40 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg" />
              <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-lg" />
            </div>
          </div>
          <div className="w-full h-px bg-slate-200 dark:bg-slate-800/50" />
          <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-slate-300 dark:bg-slate-800 rounded-md" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-slate-300 dark:bg-slate-700 rounded-md" />
                    <div className="h-3 w-48 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  </div>
                </div>
                <div className="w-10 h-5 bg-slate-200 dark:bg-slate-800 rounded-full" />
              </div>
            ))}
          </div>
          <div className="flex pt-2">
            <div className="w-full h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BotSettingsSkeleton;
