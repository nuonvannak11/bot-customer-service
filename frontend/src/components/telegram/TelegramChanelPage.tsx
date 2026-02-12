"use client";

import React, { useState } from "react";
import { Search, Send, Paperclip, Smile, Check, ArrowLeft } from "lucide-react";
import ChatActionDropdown from "@/components/telegram/ChatActionDropdown";
import UserProfileModal from "@/components/telegram/UserProfileModal";
import clsx from "clsx";
import Image from "next/image";

const contacts = [
  {
    id: 1,
    name: "Felix Kjellberg",
    username: "@pewdiepie",
    avatar: "https://buckets.onecontrol.store/assets/icon/user.png",
    time: "11:14 am",
    msg: "Hey, is the premium plan active?",
    unread: 5,
    status: "online",
    category: "all",
  },
  {
    id: 2,
    name: "IT Office 802+803",
    username: "@it_office",
    avatar: "https://buckets.onecontrol.store/assets/icon/user.png",
    time: "11:12 am",
    msg: "HAM: Please check the server logs immediately.",
    unread: 0,
    status: "offline",
    category: "skip",
  },
  {
    id: 3,
    name: "Jack Ma",
    username: "@alibaba",
    avatar: "https://buckets.onecontrol.store/assets/icon/user.png",
    time: "10:58 am",
    msg: "KG Support: Ok, handled.",
    unread: 0,
    status: "online",
    category: "accept",
  },
  {
    id: 4,
    name: "Fresh News",
    username: "@freshnews",
    avatar: "https://buckets.onecontrol.store/assets/icon/user.png",
    time: "10:47 am",
    msg: "Breaking: New API updates released...",
    unread: 1,
    status: "offline",
    category: "all",
  },
  {
    id: 5,
    name: "Elon Musk",
    username: "@elon",
    avatar: "https://buckets.onecontrol.store/assets/icon/user.png",
    time: "9:11 am",
    msg: "GIF",
    unread: 0,
    status: "online",
    category: "skip",
  },
  {
    id: 6,
    name: "EKOR Seamless API",
    username: "@ekor",
    avatar: "https://buckets.onecontrol.store/assets/icon/user.png",
    time: "8:48 am",
    msg: "A-ML: Ok, let us check and get back to you.",
    unread: 0,
    status: "offline",
    category: "accept",
  },
];

const chatHistory = [
  {
    id: 1,
    sender: "user",
    text: "Hi, I'm having trouble with the bot command.",
    time: "10:30 AM",
  },
  {
    id: 2,
    sender: "bot",
    text: "Hello Felix! I am the Nexus Support Bot. Which command is giving you errors?",
    time: "10:32 AM",
  },
  {
    id: 3,
    sender: "user",
    text: "The /broadcast command returns a 404 error.",
    time: "10:33 AM",
  },
  {
    id: 4,
    sender: "bot",
    text: "Checking your permissions...",
    time: "10:35 AM",
  },
  {
    id: 5,
    sender: "bot",
    text: "It seems your premium subscription expired yesterday. That command is locked for free users.",
    time: "10:35 AM",
  },
  {
    id: 6,
    sender: "user",
    text: "Oh! I didn't notice. Can I renew it now?",
    time: "10:40 AM",
  },
  {
    id: 7,
    sender: "bot",
    text: "Yes! You can use /renew to extend your plan immediately.",
    time: "10:41 AM",
  },
  { id: 8, sender: "user", text: "Great, thanks.", time: "10:42 AM" },
];

export default function TelegramChanelPage(chanel: any) {
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { id: "all", label: "All", count: 6 },
    { id: "skip", label: "Skip", count: 2 },
    { id: "accept", label: "Accept", count: 4 },
  ];

  const handleBack = () => {
    setSelectedContact(null);
  };

  const filteredContacts =
    activeTab === "all"
      ? contacts
      : contacts.filter((c) => c.category === activeTab);

  return (
    <div className="flex w-full h-[calc(100vh-100px)] bg-[#17212b] overflow-hidden rounded-xl shadow-2xl border border-[#0e1621]">
      <div
        className={clsx(
          "flex flex-col bg-[#17212b] h-full border-r border-black/20 transition-all duration-300",
          selectedContact ? "hidden lg:flex" : "flex w-full",
          "lg:w-[300px]",
        )}>
        <div className="shrink-0 px-3 py-3 gap-3 flex items-center">
          <div className="flex-1 bg-[#242f3d] h-10 rounded-full flex items-center px-4 transition-colors group focus-within:bg-[#242f3d] focus-within:border focus-within:border-[#3390ec] border border-transparent">
            <Search
              size={18}
              className="text-[#707579] group-focus-within:text-[#3390ec]"
            />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent border-none outline-none text-white text-[15px] w-full ml-3 placeholder-[#707579]"
            />
          </div>
        </div>

        <div className="shrink-0 flex items-center px-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "relative flex-1 py-3 text-[14px] font-medium transition-colors text-center uppercase tracking-wide",
                activeTab === tab.id
                  ? "text-[#64b5ef]"
                  : "text-[#707579] hover:text-[#e5e5e5] hover:bg-[#202b36] rounded-t-lg",
              )}>
              <div className="flex items-center justify-center gap-1.5">
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={clsx(
                      "text-[11px] font-bold px-1.5 rounded-full h-5 min-w-5 flex items-center justify-center transition-colors",
                      activeTab === tab.id
                        ? "bg-[#3390ec] text-white"
                        : "bg-[#242f3d] text-[#707579]",
                    )}>
                    {tab.count}
                  </span>
                )}
              </div>
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#64b5ef] rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>

        {/* LIST: Contacts */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#17212b]">
          {filteredContacts.map((contact) => {
            const isSelected = selectedContact?.id === contact.id;
            return (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={clsx(
                  "flex items-center px-3 py-2.5 cursor-pointer transition-colors",
                  isSelected ? "bg-[#2b5278]" : "hover:bg-[#202b36]",
                )}>
                <div className="relative shrink-0 mr-3">
                  <Image
                    src={contact.avatar}
                    alt={contact.name}
                    width={50}
                    height={50}
                    className="w-[50px] h-[50px] rounded-full bg-[#242f3d] object-cover"
                  />
                  {contact.status === "online" && (
                    <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-[#17212b] rounded-full flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-[#42d4a6] rounded-full"></div>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="text-[15px] font-bold text-white truncate">
                      {contact.name}
                    </h4>
                    <div className="flex items-center gap-1">
                      {isSelected && (
                        <Check size={14} className="text-[#64b5ef]" />
                      )}
                      <span
                        className={clsx(
                          "text-[12px]",
                          isSelected ? "text-[#a2b5c7]" : "text-[#707579]",
                        )}>
                        {contact.time}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <p
                      className={clsx(
                        "text-[14px] truncate max-w-[85%]",
                        isSelected ? "text-[#e5e5e5]" : "text-[#707579]",
                      )}>
                      {contact.msg}
                    </p>
                    {contact.unread > 0 && (
                      <div
                        className={clsx(
                          "min-w-[22px] h-[22px] px-1.5 rounded-full flex items-center justify-center text-[12px] font-bold text-white shadow-sm",
                          isSelected
                            ? "bg-white text-[#3390ec]"
                            : "bg-[#3390ec]",
                        )}>
                        {contact.unread}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className={clsx(
          "flex-1 flex-col h-full bg-[#0e1621] transition-all duration-300",
          selectedContact ? "flex w-full z-20" : "hidden lg:flex",
          "bg-[url('https://web.telegram.org/img/bg_0.png')] bg-cover relative",
        )}>
        <div className="absolute inset-0 bg-[#0e1621]/90 pointer-events-none"></div>

        {!selectedContact && (
          <div className="hidden lg:flex flex-col items-center justify-center h-full relative z-10">
            <span className="bg-[#17212b] px-4 py-1.5 rounded-full text-[#707579] text-sm font-medium shadow-md">
              Select a chat to start messaging
            </span>
          </div>
        )}

        {selectedContact && (
          <div className="relative z-10 flex flex-col h-full w-full">
            <div className="h-[60px] px-4 bg-[#17212b] flex justify-between items-center shadow-md shrink-0 border-b border-black/20">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBack}
                  className="lg:hidden text-[#e5e5e5] p-2 -ml-2 rounded-full hover:bg-[#2b2d31]">
                  <ArrowLeft size={22} />
                </button>
                <div
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => setProfileOpen(true)}>
                  <Image
                    src={selectedContact.avatar}
                    alt={selectedContact.name}
                    width={50}
                    height={50}
                    className="w-10 h-10 rounded-full object-cover bg-[#242f3d]"
                  />
                  <div>
                    <h3 className="text-white font-bold text-[16px] leading-tight group-hover:underline">
                      {selectedContact.name}
                    </h3>
                    <p className="text-[13px] text-[#707579]">
                      last seen recently
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 text-[#707579]">
                <ChatActionDropdown />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {chatHistory.map((msg) => {
                const isBot = msg.sender === "bot";
                return (
                  <div
                    key={msg.id}
                    className={clsx(
                      "flex w-full mb-2",
                      isBot ? "justify-start" : "justify-end",
                    )}>
                    <div
                      className={clsx(
                        "relative max-w-[85%] md:max-w-[65%] px-3 py-1.5 rounded-lg text-[15px] shadow-sm",
                        isBot
                          ? "bg-[#182533] text-white rounded-tl-none"
                          : "bg-[#2b5278] text-white rounded-tr-none",
                      )}>
                      {isBot && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[#64b5ef] font-bold text-[13px]">
                            Nexus Bot
                          </span>
                          <span className="text-[10px] text-[#707579] bg-[#17212b] px-1 rounded uppercase tracking-wide">
                            BOT
                          </span>
                        </div>
                      )}
                      <p className="leading-relaxed">{msg.text}</p>
                      <span
                        className={clsx(
                          "float-right ml-3 mt-1.5 text-[11px]",
                          isBot ? "text-[#707579]" : "text-[#7aa6d6]",
                        )}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-2 bg-[#17212b] shrink-0 border-t border-black/20">
              <div className="flex items-end gap-2 max-w-4xl mx-auto w-full">
                <button className="p-3 text-[#707579] hover:text-[#e5e5e5] transition rounded-full hover:bg-[#2b2d31]">
                  <Paperclip size={24} />
                </button>
                <div className="flex-1 bg-[#0e1621] rounded-xl flex items-center min-h-12 px-4 border border-transparent focus-within:border-[#0e1621] transition-colors">
                  <textarea
                    rows={1}
                    placeholder="Write a message..."
                    className="bg-transparent text-white text-[16px] placeholder-[#707579] resize-none outline-none w-full h-6 max-h-32"
                  />
                </div>
                <button className="p-3 text-[#707579] hover:text-[#e5e5e5] transition rounded-full hover:bg-[#2b2d31]">
                  <Smile size={24} />
                </button>
                <button className="p-3 text-[#3390ec] hover:bg-[#2b5278] rounded-full transition">
                  <Send size={24} className="fill-current" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {isProfileOpen && selectedContact && (
        <UserProfileModal
          contact={selectedContact}
          onClose={() => setProfileOpen(false)}
        />
      )}
    </div>
  );
}
