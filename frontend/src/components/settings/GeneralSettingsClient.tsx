"use client";

interface SettingsPropsChild {
  general: {
    workspaceName: string;
    timezone: string;
  };
  security: {
    twoFactor: boolean;
    blockUnknownIPs: boolean;
  };
  telegram: {
    botToken: string;
    botName: string;
    botUsername: string;
    botId: string;
    contacts: number;
    avatar: string;
  };
}

export interface SettingsProps {
  initialSettings: SettingsPropsChild;
}

export default function GeneralSettingsClient({
  initialSettings,
}: SettingsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-300">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Workspace Name
        </label>
        <input
          defaultValue={initialSettings.general.workspaceName}
          className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Timezone
        </label>
        <select
          defaultValue={initialSettings.general.timezone}
          className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white">
          <option value="Asia/Phnom_Penh">Asia/Phnom_Penh</option>
          <option value="UTC">UTC</option>
          <option value="Asia/Bangkok">Asia/Bangkok</option>
        </select>
      </div>
    </div>
  );
}
