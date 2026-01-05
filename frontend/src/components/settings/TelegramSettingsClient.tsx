"use client";

export default function TelegramSettingsClient({
  initialSettings,
}: {
  initialSettings: any;
}) {
  return (
    <div className="space-y-4 max-w-xl animate-in fade-in duration-300">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">
        Telegram Bot Settings
      </h3>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Bot Token
        </label>
        <input
          type="password"
          defaultValue={initialSettings.telegram.botToken}
          className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg outline-none dark:text-white"
        />
      </div>
    </div>
  );
}
