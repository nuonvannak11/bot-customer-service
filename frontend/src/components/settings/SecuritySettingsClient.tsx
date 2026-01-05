"use client";

export default function SecuritySettingsClient({
  initialSettings,
}: {
  initialSettings: any;
}) {
  return (
    <div className="max-w-xl space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 dark:text-white">
          Security
        </h3>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          New Admin Password
        </label>
        <input
          type="password"
          className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
          placeholder="Enter new password"
        />
      </div>

      <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          defaultChecked={initialSettings.security.twoFactor}
          className="rounded border-gray-300 dark:border-slate-700"
        />
        Require 2FA for admins
      </label>

      <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
        <input
          type="checkbox"
          defaultChecked={initialSettings.security.blockUnknownIPs}
          className="rounded border-gray-300 dark:border-slate-700"
        />
        Block login from unknown IPs
      </label>
    </div>
  );
}
