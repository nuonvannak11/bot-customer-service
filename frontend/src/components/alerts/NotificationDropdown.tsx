"use client";

import React, { useRef, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Bell, AlertTriangle, CheckCircle, Info } from "lucide-react";
import clsx from "clsx";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // 1. Removed 'scope'
  const { contextSafe } = useGSAP(
    () => {
      // 2. Safety Check
      if (!isOpen || !contentRef.current) return;

      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: -8, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.2,
          ease: "power2.out",
        }
      );
    },
    { dependencies: [isOpen] }
  );

  const animateOut = contextSafe(() => {
    if (!contentRef.current) return; // Safety check
    gsap.to(contentRef.current, {
      opacity: 0,
      y: -8,
      scale: 0.96,
      duration: 0.15,
      ease: "power2.in",
      onComplete: () => setIsOpen(false),
    });
  });

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setIsOpen(true);
    } else {
      animateOut();
    }
  };

  const notifications = [
    { id: 1, title: "Server CPU High", time: "2m ago", type: "critical" },
    { id: 2, title: "New User Registered", time: "1h ago", type: "success" },
    { id: 3, title: "Backup Completed", time: "3h ago", type: "info" },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertTriangle size={16} className="text-rose-500" />;
      case "success":
        return <CheckCircle size={16} className="text-emerald-500" />;
      default:
        return <Info size={16} className="text-sky-500" />;
    }
  };

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenu.Trigger asChild>
        <button
          suppressHydrationWarning={true}
          className="relative cursor-pointer p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          ref={contentRef}
          onInteractOutside={(e) => {
            e.preventDefault();
            animateOut();
          }}
          className="notif-content z-50 w-72 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xl p-2 origin-top-right will-change-transform"
          sideOffset={8}
          align="end"
        >
          <div className="px-3 py-2 border-b border-gray-100 dark:border-slate-800 mb-1">
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
              Notifications
            </h3>
          </div>

          <div className="space-y-1">
            {notifications.map((item) => (
              <DropdownMenu.Item
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer outline-none transition-colors"
              >
                <div
                  className={clsx(
                    "mt-0.5 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  )}
                >
                  {getIcon(item.type)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                </div>
              </DropdownMenu.Item>
            ))}
          </div>

          <div className="pt-2 mt-1 border-t border-gray-100 dark:border-slate-800">
            <button className="w-full text-center text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 py-1">
              View all activity
            </button>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}