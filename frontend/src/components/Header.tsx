"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Menu, Search, Sun, Moon } from "lucide-react";
import ProfileDropdown from "./ProfileDropdown";
import LanguageDropdown from "./LanguageDropdown";
import NotificationDropdown from "./alerts/NotificationDropdown"; // <--- Import this

export default function Header({ 
  setSidebarOpen, 
}: { 
  setSidebarOpen: (v: boolean) => void,
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu size={24} />
        </button>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">NexusAdmin</p>
          <h1 className="text-lg font-semibold text-slate-800 dark:text-white">Dashboard</h1>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Search Bar */}
        <div className="hidden md:block relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search size={16} className="text-slate-400" />
          </span>
          <input
            type="text"
            className="w-64 py-1.5 pl-10 pr-4 text-sm bg-gray-100 dark:bg-slate-800 border-none rounded-full focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none"
            placeholder="Search pages, users, logs..."
          />
        </div>

        {/* Language Switcher */}
        <LanguageDropdown />

        {/* Theme Toggle (Working now!) */}
        <button 
          onClick={toggleTheme} 
          className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          {/* Only show icon after client mount to prevent hydration error */}
          {mounted && theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notification Dropdown (Working now!) */}
        <NotificationDropdown />

        {/* Profile Dropdown */}
        <ProfileDropdown />
      </div>
    </header>
  );
}