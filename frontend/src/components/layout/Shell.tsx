"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { UserProfileConfig } from "@/interface";

interface ShellProps {
  option: {
    hash_key: string;
    user: UserProfileConfig;
    defaultOpenState: Record<string, boolean>;
  };
  children: React.ReactNode;
}

export default function Shell({ option, children }: ShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, defaultOpenState } = option;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200">
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
        />
      )}

      <Sidebar
        user={user}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        defaultOpenState={defaultOpenState}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header hash_key={option.hash_key} user={user} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-2 lg:p-4 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}
