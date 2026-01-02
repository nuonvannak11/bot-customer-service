"use client";
import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";

export default function SettingsClient({ initialSettings }: { initialSettings: any }) {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="border-b border-gray-200 dark:border-slate-800">
        <nav className="flex -mb-px overflow-x-auto">
          {['general', 'security', 'integrations', 'telegram'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "px-6 py-4 text-sm cursor-pointer font-medium border-b-2 transition-colors capitalize whitespace-nowrap",
                activeTab === tab
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-6 space-y-6">
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Workspace Name</label>
              <input 
                defaultValue={initialSettings.general.workspaceName} 
                className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Timezone</label>
              <select 
                defaultValue={initialSettings.general.timezone}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
              >
                <option value="Asia/Phnom_Penh">Asia/Phnom_Penh</option>
                <option value="UTC">UTC</option>
                <option value="Asia/Bangkok">Asia/Bangkok</option>
              </select>
            </div>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <div className="max-w-xl space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-white">Security</h3>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Admin Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white" 
                placeholder="••••••••" 
              />
            </div>
            <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
              <input type="checkbox" defaultChecked={initialSettings.security.twoFactor} className="rounded border-gray-300 dark:border-slate-700" /> 
              Require 2FA for admins
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
              <input type="checkbox" defaultChecked={initialSettings.security.blockUnknownIPs} className="rounded border-gray-300 dark:border-slate-700" /> 
              Block login from unknown IPs
            </label>
          </div>
        )}

        {/* INTEGRATIONS TAB */}
        {activeTab === 'integrations' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-800">
              <h4 className="font-semibold text-slate-900 dark:text-white">Telegram</h4>
              <p className="text-sm text-slate-500 mt-1">Webhook / token settings.</p>
              <button 
                onClick={() => setActiveTab('telegram')} 
                className="mt-4 cursor-pointer px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm"
              >
                Configure Telegram
              </button>
            </div>
            <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-800">
              <h4 className="font-semibold text-slate-900 dark:text-white">Facebook</h4>
              <p className="text-sm text-slate-500 mt-1">Page permissions, webhooks.</p>
              <Link href="/facebook" className="mt-4 inline-block px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm">
                Open Facebook
              </Link>
            </div>
          </div>
        )}
        
        {/* TELEGRAM SETTINGS TAB */}
        {activeTab === 'telegram' && (
          <div className="space-y-4 max-w-xl animate-in fade-in duration-300">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Telegram Bot Settings</h3>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bot Token</label>
                <input type="password" defaultValue={initialSettings.telegram.botToken} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg outline-none dark:text-white" />
            </div>
          </div>
        )}

      </div>

      {/* SAVE BUTTON FOOTER */}
      <div className="pt-4 border-t border-gray-200 dark:border-slate-800 flex justify-end p-6">
        <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">Save Settings</button>
      </div>
    </div>
  );
}