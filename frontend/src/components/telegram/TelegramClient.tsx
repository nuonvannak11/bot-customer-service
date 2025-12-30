"use client";
import { Send, Pencil } from "lucide-react";

export default function TelegramClient({ data }: { data: any }) {
  return (
    <div>
      {/* Bot Info Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center text-white font-bold">Bot</div>
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">{data.botName}</h3>
              <p className="text-sm text-slate-500">Status: <span className="text-emerald-500">{data.status}</span></p>
            </div>
          </div>
          <button className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm">Disconnect</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Broadcast Area */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800">
          <h4 className="font-medium text-slate-900 dark:text-white mb-4">Broadcast Message</h4>
          <textarea className="w-full h-32 p-3 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-sky-500" placeholder="Type your message..." />
          <button className="mt-4 px-6 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium">Send Broadcast</button>
        </div>

        {/* Recent Chats */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800">
          <h4 className="font-medium text-slate-900 dark:text-white mb-4">Recent Chats</h4>
          <ul className="space-y-2">
            {data.chats.map((chat: any) => (
              <li key={chat.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{chat.name}</p>
                  <p className="text-xs text-slate-500 truncate">{chat.lastMsg}</p>
                </div>
                <span className="text-xs text-slate-400">{chat.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}