"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  LayoutDashboard,
  FileText,
  Send,
  Smartphone,
  Facebook,
  Bell,
  BarChart2,
  Settings,
  MessageSquare,
  LayoutTemplate,
  Contact,
  Users,
  Megaphone,
  ShieldCheck,
  MoreHorizontal,
} from "lucide-react";
import clsx from "clsx";
import SidebarDropdown from "./SidebarDropdown";
import TiktokIcon from "./icons/TiktokIcon";
import { UserProfileConfig } from "@/interface";
import { STATIC_IMG_PROFILE } from "@/constants/default";

export default function Sidebar({
  user,
  sidebarOpen,
  setSidebarOpen,
  defaultOpenState,
}: {
  user: UserProfileConfig;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  defaultOpenState: Record<string, boolean>;
}) {
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const navItemClass = (path: string) =>
    clsx(
      "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
      pathname === path || pathname.startsWith(`${path}/`)
        ? "bg-primary-50 text-primary-600 dark:bg-primary-900/10 dark:text-primary-400"
        : "text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800",
    );

  const telegramItems = [
    { title: "Overviews", href: "/telegram", icon: LayoutTemplate },
    { title: "Contact", href: "/telegram/contact", icon: Contact },
    { title: "Group", href: "/telegram/group", icon: Users },
    { title: "Channel", href: "/telegram/channel", icon: Megaphone },
    { title: "Protect", href: "/telegram/protect", icon: ShieldCheck },
    { title: "Other", href: "/telegram/other", icon: MoreHorizontal },
  ];

  return (
    <aside
      className={clsx(
        "fixed inset-y-0 left-0 z-30 w-64 transform bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 lg:static lg:translate-x-0 flex flex-col transition-transform duration-200 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
      )}>
      <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-slate-800">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold text-xl text-indigo-500">
          <LayoutGrid size={24} />
          <span>Management System</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Main
        </p>
        <Link
          href="/dashboard"
          className={navItemClass("/dashboard")}
          onClick={handleLinkClick}>
          <LayoutDashboard size={20} className="mr-3" />
          <span className={clsx(sidebarOpen ? "block" : "hidden lg:block")}>
            Dashboard
          </span>
        </Link>
        <Link
          href="/pages"
          className={navItemClass("/pages")}
          onClick={handleLinkClick}>
          <FileText size={20} className="mr-3" />
          <span className={clsx(sidebarOpen ? "block" : "hidden lg:block")}>
            Pages
          </span>
        </Link>

        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-2">
          Integrations
        </p>

        <SidebarDropdown
          icon={Send}
          title="Telegram"
          mainHref="/telegram"
          items={telegramItems}
          isOpen={true}
          defaultOpen={defaultOpenState["nexus_sidebar_telegram"] === true}
          onLinkClick={handleLinkClick}
        />

        <Link
          href="/mini-app"
          className={navItemClass("/mini-app")}
          onClick={handleLinkClick}>
          <Smartphone size={20} className="mr-3" /> Mini App
        </Link>
        <Link
          href="/facebook"
          className={navItemClass("/facebook")}
          onClick={handleLinkClick}>
          <Facebook size={20} className="mr-3" /> Facebook
        </Link>

        <Link
          href="/tiktok"
          className={navItemClass("/tiktok")}
          onClick={handleLinkClick}>
          <TiktokIcon size={15} className="mr-3" /> Tiktok
        </Link>
        <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-2">
          System
        </p>
        <Link
          href="/alerts"
          className={navItemClass("/alerts")}
          onClick={handleLinkClick}>
          <Bell size={20} className="mr-3" /> Alerts
        </Link>
        <Link
          href="/reports"
          className={navItemClass("/reports")}
          onClick={handleLinkClick}>
          <BarChart2 size={20} className="mr-3" /> Reports
        </Link>
        <Link
          href="/settings/general"
          className={navItemClass("/settings")}
          onClick={handleLinkClick}>
          <Settings size={20} className="mr-3" /> Settings
        </Link>
      </nav>

      <div className="border-t border-gray-200 dark:border-slate-800 p-4">
        <Link
          href="/profile"
          className="flex items-center w-full group"
          onClick={handleLinkClick}>
          <img
            className="h-9 w-9 rounded-full object-cover border border-slate-300 dark:border-slate-600"
            src={user.avatar ?? STATIC_IMG_PROFILE}
            alt="User avatar"
          />
          <div className="ml-3 truncate">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-500">
              {user.username}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user.email}
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
