import Link from "next/link";
import clsx from "clsx";

export type SettingsTab = "general" | "security" | "integrations" | "telegram";

const tabs: Array<{ key: SettingsTab; href: string; label: string }> = [
  { key: "general", href: "/settings/general", label: "General" },
  { key: "security", href: "/settings/security", label: "Security" },
  { key: "integrations", href: "/settings/integrations", label: "Integrations" },
  { key: "telegram", href: "/settings/telegram", label: "Telegram" },
];

export default function SettingsClient({
  activeTab,
  children,
}: {
  activeTab: SettingsTab;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="border-b border-gray-200 dark:border-slate-800">
        <nav className="flex -mb-px overflow-x-auto">
          {tabs.map((tab) => (
            <Link
              key={tab.key}
              href={tab.href}
              className={clsx(
                "px-6 py-4 text-sm cursor-pointer font-medium border-b-2 transition-colors whitespace-nowrap",
                activeTab === tab.key
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
              aria-current={activeTab === tab.key ? "page" : undefined}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="p-6 space-y-6">{children}</div>

      <div className="pt-4 border-t border-gray-200 dark:border-slate-800 flex justify-end p-6">
        <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">
          Save Settings
        </button>
      </div>
    </div>
  );
}
