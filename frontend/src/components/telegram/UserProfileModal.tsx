"use client";

import React, { useState } from "react";
import { X, AtSign, Info, Phone, Bell, UserX } from "lucide-react";
import clsx from "clsx";
import { TelegramContact } from "@/interface/telegram/interface.telegram";
import Image from "next/image";

export default function UserProfileModal({
  contact,
  onClose,
}: {
  contact: TelegramContact;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState("media");
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative w-full max-w-xs sm:max-w-sm bg-[#17212b] rounded-lg sm:rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="relative h-48 sm:h-60 w-full shrink-0">
          <Image
            src={contact.avatar}
            width={50}
            height={50}
            className="w-full h-full object-cover"
            alt={contact.name}
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full p-2 sm:p-4">
            <h2 className="text-lg sm:text-xl font-bold text-white">{contact.name}</h2>
            <p className="text-[#a2b5c7] text-xs sm:text-sm font-medium">online</p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-10 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-all duration-200 hover:scale-110"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-2 sm:p-4 space-y-3 sm:space-y-4">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-start gap-3 sm:gap-4 text-white">
                <div className="text-[#a2b5c7] mt-1">
                  <AtSign size={18} />
                </div>
                <div>
                  <p className="text-sm sm:text-base">{contact.username}</p>
                  <p className="text-xs text-[#a2b5c7]">Username</p>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:gap-4 text-white">
                <div className="text-[#a2b5c7] mt-1">
                  <Info size={18} />
                </div>
                <div>
                  <p className="text-sm sm:text-base leading-tight">
                    Digital nomad. Investor. CEO of a cool company.
                  </p>
                  <p className="text-xs text-[#a2b5c7]">Bio</p>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:gap-4 text-white">
                <div className="text-[#a2b5c7] mt-1">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-sm sm:text-base">+1 (555) 123-4567</p>
                  <p className="text-xs text-[#a2b5c7]">Mobile</p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10"></div>

            {/* Actions */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-white p-2 rounded-lg hover:bg-[#202b36] cursor-pointer transition">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-[#a2b5c7]">
                    <Bell size={18} />
                  </div>
                  <p className="text-sm sm:text-base">Notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    value=""
                    className="sr-only peer"
                    defaultChecked
                  />
                  <div className="w-11 h-6 bg-[#2c3a4a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 text-[#ef5b5b] p-2 rounded-lg hover:bg-[#202b36] cursor-pointer transition">
                <div className="text-[#ef5b5b]">
                  <UserX size={18} />
                </div>
                <p className="text-sm sm:text-base font-medium">Block User</p>
              </div>
            </div>
            <div className="border-t border-white/10"></div>
            <div>
              <div className="flex justify-around bg-[#202b36] rounded-lg p-1">
                <button
                  onClick={() => setActiveTab("media")}
                  className={clsx(
                    "w-full py-2 text-xs sm:text-sm rounded-md transition",
                    activeTab === "media"
                      ? "bg-[#2b5278] text-white"
                      : "text-[#a2b5c7]"
                  )}
                >
                  Media
                </button>
                <button
                  onClick={() => setActiveTab("files")}
                  className={clsx(
                    "w-full py-2 text-xs sm:text-sm rounded-md transition",
                    activeTab === "files"
                      ? "bg-[#2b5278] text-white"
                      : "text-[#a2b5c7]"
                  )}
                >
                  Files
                </button>
                <button
                  onClick={() => setActiveTab("links")}
                  className={clsx(
                    "w-full py-2 text-xs sm:text-sm rounded-md transition",
                    activeTab === "links"
                      ? "bg-[#2b5278] text-white"
                      : "text-[#a2b5c7]"
                  )}
                >
                  Links
                </button>
              </div>
              <div className="pt-2 sm:pt-4">
                {activeTab === "media" && (
                  <div className="grid grid-cols-3 gap-1">
                    <div className="bg-[#242f3d] aspect-square rounded-md animate-pulse"></div>
                    <div className="bg-[#242f3d] aspect-square rounded-md animate-pulse delay-75"></div>
                    <div className="bg-[#242f3d] aspect-square rounded-md animate-pulse delay-150"></div>
                    <div className="bg-[#242f3d] aspect-square rounded-md animate-pulse delay-200"></div>
                  </div>
                )}
                {activeTab === "files" && (
                  <div className="text-center text-[#a2b5c7] py-8 text-sm">
                    No files shared yet.
                  </div>
                )}
                {activeTab === "links" && (
                  <div className="text-center text-[#a2b5c7] py-8 text-sm">
                    No links shared yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
