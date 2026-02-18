"use client";

import React, { useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { CalendarClock, User, Users, ShieldAlert } from "lucide-react";
import gsap from "gsap";
import { capitalize } from "@/utils/util";
import { ConfirmGroupModalProps } from "@/interface/interface.telegram";

export function ConfirmGroupModal({
  t,
  event_data,
  setConfirmGroupEvent,
  onApprove,
}: ConfirmGroupModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (event_data && modalRef.current && overlayRef.current) {
      gsap.fromTo(
        modalRef.current,
        { scale: 0.8, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.2)" },
      );

      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 },
      );

      gsap.fromTo(
        ".gsap-row",
        { x: -15, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.1,
          delay: 0.1,
          ease: "power2.out",
        },
      );
    }
  }, [event_data]);

  if (!event_data) return null;
  return (
    <Dialog.Root
      open={!!event_data}
      onOpenChange={(isOpen) => {
        if (!isOpen) setConfirmGroupEvent(null);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay
          ref={overlayRef}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
        />
        <Dialog.Content asChild>
          <div
            ref={modalRef}
            className="fixed left-[50%] top-[50%] z-50 w-full max-w-[380px] translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-[0_0_50px_-12px_rgba(245,158,11,0.25)] overflow-hidden focus:outline-none"
          >
            <div className="px-5 py-5 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-4">
              <div className="bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 p-2.5 rounded-full drop-shadow-[0_0_12px_rgba(245,158,11,0.6)] animate-pulse">
                <ShieldAlert size={20} />
              </div>
              <div>
                <Dialog.Title className="text-lg font-bold text-slate-900 dark:text-white">
                  {t("Approve Target")}
                </Dialog.Title>
                <Dialog.Description className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {t("Please verify details before adding.")}
                </Dialog.Description>
              </div>
            </div>

            <div className="px-5 py-5 text-sm space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="gsap-row flex justify-between items-center">
                <span className="text-slate-500 flex items-center gap-2">
                  <CalendarClock size={15} /> {t("Date")}
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-200">
                  {event_data.data_time || "N/A"}
                </span>
              </div>
              <hr className="border-slate-100 dark:border-slate-800/60" />
              <div className="gsap-row">
                <div className="text-slate-500 flex items-center gap-2 mb-2.5">
                  <User size={15} /> {t("Sender Info")}
                </div>
                <div className="grid grid-cols-[50px_1fr] gap-y-1.5 pl-6 text-xs">
                  <span className="text-slate-400">{t("Name")}:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">
                    {event_data.sender.full_name}
                  </span>
                  <span className="text-slate-400">{t("User")}:</span>
                  <span className="text-slate-700 dark:text-slate-300">
                    {event_data.sender.user_name}
                  </span>
                </div>
              </div>
              <hr className="border-slate-100 dark:border-slate-800/60" />
              <div className="gsap-row">
                <div className="text-slate-500 flex items-center gap-2 mb-2.5">
                  <Users size={15} /> {t("Target Info")}
                </div>
                <div className="grid grid-cols-[50px_1fr] gap-y-1.5 pl-6 text-xs">
                  <span className="text-slate-400">{t("ID")}:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {event_data.group_chanel.chatId}
                  </span>
                  <span className="text-slate-400">{t("Name")}:</span>
                  <span className="font-medium text-slate-900 dark:text-slate-200">
                    {event_data.group_chanel.name}
                  </span>
                  <span className="text-slate-400">{t("Type")}:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">
                    {capitalize(event_data.group_chanel.type)}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800/60 flex gap-3">
              <button
                onClick={() => setConfirmGroupEvent(null)}
                className="cursor-pointer flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl transition-colors"
              >
                {t("Cancel")}
              </button>
              <button
                onClick={() => onApprove(event_data)}
                className="cursor-pointer flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              >
                {t("Approve")}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
