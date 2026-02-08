"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Menu, Search, Sun, Moon } from "lucide-react";
import { useTranslation } from "react-i18next";
import ProfileDropdown from "./ProfileDropdown";
import LanguageDropdown from "./LanguageDropdown";
import NotificationDropdown from "./alerts/NotificationDropdown";
import { UserProfileConfig } from "@/interface";

export default function Header({
  user,
  setSidebarOpen,
}: {
  user: UserProfileConfig;
  setSidebarOpen: (v: boolean) => void;
}) {
  const { t } = useTranslation();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/80 px-4 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
        >
          <Menu size={24} />
        </button>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="relative hidden md:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={16} className="text-slate-400" />
          </span>
          <input
            type="text"
            className="w-64 rounded-full border-none bg-gray-100 py-1.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-800 dark:text-slate-200"
            placeholder={t("Search here...")}
            aria-label={t("Search here...")}
          />
        </div>

        <LanguageDropdown />

        <button
          onClick={toggleTheme}
          disabled={!mounted}
          className="cursor-pointer rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 focus:ring-2 focus:ring-indigo-500/20 outline-none dark:hover:bg-slate-800"
        >
          {!mounted ? (
            <div className="h-5 w-5" /> 
          ) : (theme === "dark" || resolvedTheme === "dark") ? (
            <Sun size={20} />
          ) : (
            <Moon size={20} />
          )}
        </button>
        <NotificationDropdown />
        <ProfileDropdown user={user} />
      </div>
    </header>
  );
}