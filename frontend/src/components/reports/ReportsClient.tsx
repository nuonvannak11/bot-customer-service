"use client";
import { Download } from "lucide-react";

interface StatsChlid {
  value: string;
  change: string;
}

interface Stats {
  newUsers: StatsChlid;
  messages: StatsChlid;
  alerts: StatsChlid;
}

interface ReportsClientProps {
  stats: Stats;
}

export default function ReportsClient({ stats }: ReportsClientProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold dark:text-white">Analytics</h2>
        <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm flex items-center gap-2 dark:text-slate-200">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Placeholder for Charts since we don't have Chart.js installed in environment */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 h-72 flex items-center justify-center text-slate-400">
          [Chart Component Placeholder]
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-slate-800 font-semibold dark:text-white">
            Summary
          </div>
          <div className="p-4 space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-500">New Users</span>
              <span className="font-medium dark:text-white">
                {stats.newUsers.value}{" "}
                <span className="text-emerald-500 text-xs">
                  {stats.newUsers.change}
                </span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Messages</span>
              <span className="font-medium dark:text-white">
                {stats.messages.value}{" "}
                <span className="text-amber-500 text-xs">
                  {stats.messages.change}
                </span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Alerts</span>
              <span className="font-medium dark:text-white">
                {stats.alerts.value}{" "}
                <span className="text-rose-500 text-xs">
                  {stats.alerts.change}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
