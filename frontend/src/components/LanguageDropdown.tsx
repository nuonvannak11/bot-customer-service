"use client";

import React, { useRef, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Check } from "lucide-react";
import clsx from "clsx";

export default function LanguageDropdown() {
  const [lang, setLang] = useState<"en" | "km">("en");
  
  const contentRef = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP({ scope: contentRef });

  const animateIn = contextSafe(() => {
    gsap.fromTo(
      ".lang-content",
      { opacity: 0, y: -8, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: "power2.out" }
    );
  });

  const languages = [
    { code: "en", label: "English", icon: "/icon/en.png" },
    { code: "km", label: "Khmer", icon: "/icon/km.png" },
  ];

  const currentFlag = languages.find((l) => l.code === lang)?.icon || "/icon/en.png";

  return (
    <DropdownMenu.Root onOpenChange={(open) => open && setTimeout(animateIn, 10)}>
      <DropdownMenu.Trigger asChild>
        <button className="p-2 cursor-pointer rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors outline-none focus:ring-2 focus:ring-indigo-500/20">
          <img
            src={currentFlag}
            alt="Current Language"
            className="w-5 h-5 object-cover rounded-full border border-slate-200 dark:border-slate-700"
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          ref={contentRef}
          className="lang-content z-50 min-w-[150px] bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-xl p-1.5 origin-top-right will-change-transform"
          sideOffset={8} 
          align="end" 
        >
          {languages.map((l) => (
            <DropdownMenu.Item
              key={l.code}
              className={clsx(
                "flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg cursor-pointer outline-none transition-colors",
                lang === l.code 
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400" 
                  : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
              onClick={() => setLang(l.code as "en" | "km")}
            >
              <div className="flex items-center gap-3">
                <img src={l.icon} alt={l.code} className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                <span>{l.label}</span>
              </div>
              {lang === l.code && <Check size={14} className="text-indigo-600 dark:text-indigo-400" />}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}