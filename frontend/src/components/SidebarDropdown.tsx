"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ChevronDown, LucideIcon } from "lucide-react";
import clsx from "clsx";
import Cookies from "js-cookie";

interface SubItem {
  title: string;
  href: string;
  icon?: LucideIcon;
}

interface SidebarDropdownProps {
  icon: LucideIcon;
  title: string;
  mainHref: string;
  items: SubItem[];
  isOpen: boolean;
  defaultOpen?: boolean;
  onLinkClick?: () => void;
}

export default function SidebarDropdown({
  icon: Icon,
  title,
  mainHref,
  items,
  isOpen,
  defaultOpen = false,
  onLinkClick,
}: SidebarDropdownProps) {
  const pathname = usePathname();
  const isActiveParent = pathname.startsWith(mainHref);
  
  const [isExpanded, setIsExpanded] = useState(defaultOpen);
  const isFirstRender = useRef(true);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  const cookieKey = `nexus_sidebar_${title.toLowerCase()}`;

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    Cookies.set(cookieKey, JSON.stringify(newState), { expires: 7 });
  };

  useGSAP(() => {
    if (!contentRef.current || !arrowRef.current) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (defaultOpen) {
         gsap.set(contentRef.current, { height: "auto", opacity: 1 });
         gsap.set(arrowRef.current, { rotation: 180 });
      }
      return; 
    }

    if (isExpanded) {
      gsap.to(contentRef.current, { height: "auto", opacity: 1, duration: 0.3, ease: "power2.out" });
      gsap.to(arrowRef.current, { rotation: 180, duration: 0.3, ease: "power2.out" }); // Added ease here too
    } else {
      gsap.to(contentRef.current, { height: 0, opacity: 0, duration: 0.2, ease: "power2.in" });
      gsap.to(arrowRef.current, { rotation: 0, duration: 0.3, ease: "power2.out" });
    }
  }, [isExpanded]);

  return (
    <div className="relative group">
      <button
        type="button"
        className={clsx(
          "flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors cursor-pointer select-none outline-none focus:bg-slate-100 dark:focus:bg-slate-800",
          isActiveParent
            ? "bg-primary-50 text-primary-600 dark:bg-primary-900/10 dark:text-primary-400"
            : "text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        )}
        onClick={handleToggle}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center flex-1">
          <Icon size={20} className="mr-3 flex-shrink-0" />
          <span className={clsx("transition-opacity duration-200", isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden")}>
            {title}
          </span>
        </div>
        
        {/* FIX: Square container (w-5 h-5) + Flex Center + origin-center */}
        <div 
          ref={arrowRef}
          className="w-5 h-5 flex items-center justify-center origin-center"
          style={{ transform: defaultOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        >
           {isOpen && <ChevronDown size={14} />}
        </div>
      </button>

      <div 
        ref={contentRef} 
        className={clsx("overflow-hidden", defaultOpen ? "h-auto opacity-100" : "h-0 opacity-0")}
      >
        <div className={clsx("pt-1 ml-4 pl-4 border-l border-slate-200 dark:border-slate-800 space-y-1", !isOpen && "hidden")}>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={clsx(
                "flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-colors block",
                pathname === item.href
                  ? "text-primary-600 bg-slate-50 dark:text-primary-400 dark:bg-slate-800/50"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              {item.icon && <item.icon size={14} className="mr-2 opacity-75" />}
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}