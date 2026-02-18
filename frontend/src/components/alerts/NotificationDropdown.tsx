"use client";

import React, { useRef, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Bell, AlertTriangle, CheckCircle, Info } from "lucide-react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { ConfirmGroupModal } from "../modal/ConfirmGroupModal";
import { useSocketStore } from "@/sockets/store";
import { ConfrimGroupChanel } from "@/interface/interface.telegram";
import { request_sweet_alert } from "@/helper/helper";
import toast from "react-hot-toast";
import { getErrorMessage } from "@/utils/util";

export default function NotificationDropdown({
  hash_key,
  notification,
}: {
  hash_key: string;
  notification: any;
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const confirmGroupEvent = useSocketStore((state) => state.confirmGroupEvent);
  const setConfirmGroupEvent = useSocketStore(
    (state) => state.setConfirmGroupEvent,
  );
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
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
        },
      );
    },
    { dependencies: [isOpen], scope: contentRef },
  );

  const animateOut = React.useCallback(() => {
    if (!contentRef.current) return;

    gsap.to(contentRef.current, {
      opacity: 0,
      y: -8,
      scale: 0.96,
      duration: 0.15,
      ease: "power2.in",
      onComplete: () => setIsOpen(false),
    });
  }, []);

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

  const performApiCall = async <P, R = unknown>(
    url: string,
    payload: P,
    signal?: AbortSignal,
  ): Promise<{ message: string; data: R }> => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hash_key, payload }),
      signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = (await response.json()) as unknown;
    const typedResult = result as { code: number; message: string; data: R };
    if (typedResult.code !== 200) throw new Error(typedResult.message);
    return { message: typedResult.message, data: typedResult.data };
  };

  const handleSubmit = async <Payload, Response>(
    type: string,
    payload: Payload,
  ) => {
    try {
      setLoading(true);
      const result = await request_sweet_alert(
        { title: t("Processing"), text: t("Deleting asset...") },
        async () => {
          const { message, data } = await performApiCall<Payload, Response>(
            "/api/telegram/approve-group-channel",
            payload,
          );
          return message;
        },
        (err) => {
          throw err;
        },
      );
      if (result)
        toast.success(result, { position: "top-right", duration: 1500 });
    } catch (err) {
      toast.error(getErrorMessage(err) || "An error occurred", {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApprove = async (data: ConfrimGroupChanel) => {
    setConfirmGroupEvent(null);
    await handleSubmit<ConfrimGroupChanel, string>(
      "approve_telegram_group",
      data,
    );
  };

  return (
    <React.Fragment>
      <ConfirmGroupModal
        event_data={confirmGroupEvent}
        setConfirmGroupEvent={setConfirmGroupEvent}
        t={t}
        onApprove={(data) => handleSubmitApprove(data)}
      />
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
                {t("Notifications")}
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
                      "mt-0.5 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
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
                {t("View all notifications")}
              </button>
            </div>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </React.Fragment>
  );
}
