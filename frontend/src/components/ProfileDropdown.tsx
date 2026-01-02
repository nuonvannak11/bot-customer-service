"use client";

import React, { useRef, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ChevronDown, User, Settings, LogOut } from "lucide-react";
import Link from "next/link";

export default function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP(
    () => {
      if (!isOpen || !contentRef.current) return;
      const q = gsap.utils.selector(contentRef);
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: -10, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" }
      );
      gsap.fromTo(
        q(".dropdown-item"),
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.2, stagger: 0.05, delay: 0.05 }
      );
    },
    { dependencies: [isOpen] }
  );

  const animateOut = contextSafe(() => {
    if (!contentRef.current) return;
    gsap.to(contentRef.current, {
      opacity: 0,
      y: -10,
      scale: 0.98,
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

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenu.Trigger asChild>
        <button
          suppressHydrationWarning={true}
          className="flex items-center cursor-pointer gap-2 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
        >
          <img
            className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            src="https://ui-avatars.com/api/?name=Admin+User&background=6366f1&color=fff&size=96"
            alt="Avatar"
          />
          <span className="hidden sm:block text-sm text-slate-700 dark:text-slate-200 font-medium">
            Alex
          </span>
          <ChevronDown size={16} className="text-slate-500" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          ref={contentRef}
          // Prevent Radix from unmounting immediately so we can animate out
          onInteractOutside={(e) => {
            e.preventDefault();
            animateOut();
          }}
          className="dropdown-content z-50 min-w-[12rem] bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xl p-1.5 mr-4 mt-2 origin-top-right will-change-transform"
          sideOffset={5}
          align="end"
        >
          {/* Group 1: Navigation */}
          <DropdownMenu.Group>
            <DropdownMenu.Item asChild className="dropdown-item outline-none">
              <Link
                href="/profile"
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <User size={16} className="text-slate-400" />
                Profile
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild className="dropdown-item outline-none">
              <Link
                href="/settings"
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              >
                <Settings size={16} className="text-slate-400" />
                Settings
              </Link>
            </DropdownMenu.Item>
          </DropdownMenu.Group>

          <DropdownMenu.Separator className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

          <DropdownMenu.Item className="dropdown-item outline-none">
            <button className="flex items-center gap-2 w-full px-3 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-lg cursor-pointer transition-colors">
              <LogOut size={16} />
              Log out
            </button>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
