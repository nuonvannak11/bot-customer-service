"use client";
import { Server, DollarSign, PlusCircle } from "lucide-react";
import { AlertsClientProps } from "@/interface";

export default function AlertsClient({ initialRules }: AlertsClientProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Alert Rules</h2>
          <p className="text-sm text-slate-500">Manage your monitoring rules.</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2">
          <PlusCircle size={16} /> Add Rule
        </button>
      </div>

      <div className="space-y-4">
        {initialRules.map((rule) => (
          <div key={rule.id} className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-gray-200 dark:border-slate-800 flex justify-between items-center">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${rule.name.includes('CPU') ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/20' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/20'}`}>
                {rule.name.includes('CPU') ? <Server size={20} /> : <DollarSign size={20} />}
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">{rule.name}</h4>
                <p className="text-sm text-slate-500">{rule.severity} • {rule.channel}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-xs rounded-full ${rule.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800'}`}>
                {rule.active ? 'Active' : 'Paused'}
              </span>
              <button className="text-slate-400 hover:text-slate-600">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}