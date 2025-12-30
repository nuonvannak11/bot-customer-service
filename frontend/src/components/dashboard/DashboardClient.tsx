"use client";
import { Users, DollarSign, AlertTriangle, MessageSquare, Plus, Check, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardClient({ data }: { data: any }) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Users</p>
              <h3 className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">{data.users}</h3>
            </div>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-600 dark:text-indigo-400">
              <Users size={20} />
            </div>
          </div>
          <span className="text-xs font-medium text-emerald-500 mt-4 inline-block">↑ 12% from last month</span>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Revenue</p>
              <h3 className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">{data.revenue}</h3>
            </div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
              <DollarSign size={20} />
            </div>
          </div>
          <span className="text-xs font-medium text-emerald-500 mt-4 inline-block">↑ 4% from last month</span>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Alerts</p>
              <h3 className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">{data.activeAlerts}</h3>
            </div>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400">
              <AlertTriangle size={20} />
            </div>
          </div>
          <span className="text-xs font-medium text-amber-500 mt-4 inline-block">Attention needed</span>
        </div>

        {/* Card 4 */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Messages</p>
              <h3 className="text-2xl font-bold mt-2 text-slate-900 dark:text-white">{data.messages}</h3>
            </div>
            <div className="p-2 bg-sky-50 dark:bg-sky-900/20 rounded-lg text-sky-600 dark:text-sky-400">
              <MessageSquare size={20} />
            </div>
          </div>
          <span className="text-xs font-medium text-slate-500 mt-4 inline-block">Last 24 hours</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
            <Link href="/reports" className="text-xs px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">View reports</Link>
          </div>
          <div className="p-6 space-y-5">
            {data.recentActivity.map((activity: any) => (
              <div key={activity.id} className="flex gap-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${activity.type === 'plus' ? 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                  {activity.type === 'plus' ? <Plus size={20} /> : <Check size={20} />}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{activity.title}</p>
                  <p className="text-sm text-slate-500">{activity.desc}</p>
                  <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-slate-800">
            <h3 className="font-semibold text-slate-900 dark:text-white">Quick Actions</h3>
            <p className="text-sm text-slate-500 mt-1">Common tasks.</p>
          </div>
          <div className="p-6 space-y-3">
            <Link href="/telegram" className="block p-4 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900 dark:text-white">Send Telegram Broadcast</span>
                <ArrowRight size={16} className="text-slate-400" />
              </div>
            </Link>
            <Link href="/pages" className="block p-4 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900 dark:text-white">Create a New Page</span>
                <ArrowRight size={16} className="text-slate-400" />
              </div>
            </Link>
            <Link href="/alerts" className="block p-4 rounded-xl border border-gray-200 dark:border-slate-800 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900 dark:text-white">Add Alert Rule</span>
                <ArrowRight size={16} className="text-slate-400" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}