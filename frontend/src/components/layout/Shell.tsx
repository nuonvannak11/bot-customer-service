"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { UserProfileConfig } from "@/interface";

export default function Shell({
  user,
  children,
  defaultOpenState,
}: {
  user: UserProfileConfig;
  children: React.ReactNode;
  defaultOpenState: Record<string, boolean>;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        <Header user={user} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-2 lg:p-4 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}
