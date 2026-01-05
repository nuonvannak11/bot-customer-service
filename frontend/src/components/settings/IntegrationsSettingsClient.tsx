"use client";

import Link from "next/link";

export default function IntegrationsSettingsClient() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
      <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-800">
        <h4 className="font-semibold text-slate-900 dark:text-white">Telegram</h4>
        <p className="text-sm text-slate-500 mt-1">Webhook / token settings.</p>
        <Link
          href="/settings/telegram"
          className="mt-4 inline-block cursor-pointer px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-sm"
        >
          Configure Telegram
        </Link>
      </div>
      <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-800">
        <h4 className="font-semibold text-slate-900 dark:text-white">Facebook</h4>
        <p className="text-sm text-slate-500 mt-1">Page permissions, webhooks.</p>
        <Link
          href="/facebook"
          className="mt-4 inline-block px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm"
        >
          Open Facebook
        </Link>
      </div>
    </div>
  );
}
