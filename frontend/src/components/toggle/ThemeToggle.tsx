"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="cursor-pointer rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 focus:ring-2 focus:ring-indigo-500/20 outline-none dark:hover:bg-slate-800">
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}
