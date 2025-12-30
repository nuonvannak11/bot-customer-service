"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar"; // Check your path
import Header from "@/components/Header";   // Check your path

export default function Shell({ 
  children,
  defaultOpenState, // <--- Receive prop from Server
}: { 
  children: React.ReactNode;
  defaultOpenState: Record<string, boolean>;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200">
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
        />
      )}

      {/* Pass defaultOpenState to Sidebar */}
      <Sidebar 
        sidebarOpen={sidebarOpen}
        defaultOpenState={defaultOpenState} 
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          {children}
        </main>
      </div>
    </div>
  );
}