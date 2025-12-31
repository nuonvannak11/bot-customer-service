"use client";

import React from "react";
import { 
  Zap, Hash, Globe, Clock, Send, Settings, RefreshCw, 
  Users, TrendingUp, MessageSquare, ArrowUpRight, 
  Activity, AlertOctagon, AlertCircle, BarChart2, 
  Cpu, Terminal 
} from "lucide-react";

export default function TelegramClient({ data }: { data: any }) {
  return (
    <div className="space-y-8 p-2">
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
          
          {/* Bot Avatar with Pulse Effect */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-28 h-28 rounded-full bg-slate-950 border-4 border-slate-800 p-1 flex items-center justify-center overflow-hidden">
              <img 
                src="https://api.dicebear.com/9.x/bottts/svg?seed=NexusBot" 
                alt="Bot" 
                className="w-full h-full rounded-full" 
              />
            </div>
            {/* Status Badge */}
            <div className="absolute bottom-0 right-0 translate-x-1 translate-y-1 bg-slate-900 rounded-full p-1.5 border border-slate-800">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              </div>
            </div>
          </div>

          {/* Bot Details */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
                Nexus Support Bot
              </h2>
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 text-indigo-400">
                Pro License
              </span>
            </div>
            
            <p className="text-slate-400 max-w-xl text-sm leading-relaxed">
              Automated support agent handling <span className="text-white font-medium">Ticket Routing</span>, <span className="text-white font-medium">Broadcasts</span>, and <span className="text-white font-medium">User Verification</span>.
            </p>

            {/* Mini Metrics Row */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-4 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-slate-600" />
                <span className="font-mono text-slate-300">ID: 8829104</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-600" />
                <span className="text-emerald-400">Webhook: 200 OK</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-600" />
                <span className="text-slate-300">Uptime: 14d 2h</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <button className="group relative px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-95">
              <div className="absolute inset-0 bg-white/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center justify-center gap-2">
                <Send className="w-4 h-4" /> New Broadcast
              </span>
            </button>
            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm font-medium">
                <Settings className="w-4 h-4" /> Config
              </button>
              <button className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white bg-slate-800/50 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm font-medium">
                <RefreshCw className="w-4 h-4" /> Sync
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. NEON METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div className="group relative p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
            <Users className="w-24 h-24 text-indigo-500" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-indigo-400 text-sm font-medium">
              <Users className="w-4 h-4" /> Subscribers
            </div>
            <div className="flex items-end gap-3">
              <h3 className="text-3xl font-bold text-white tracking-tight">42.8k</h3>
              <span className="mb-1 text-xs font-bold text-emerald-400 flex items-center gap-0.5 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3 h-3" /> 12%
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        {/* Card 2 */}
        <div className="group relative p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
            <MessageSquare className="w-24 h-24 text-cyan-500" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-cyan-400 text-sm font-medium">
              <MessageSquare className="w-4 h-4" /> Engagement
            </div>
            <div className="flex items-end gap-3">
              <h3 className="text-3xl font-bold text-white tracking-tight">1.2k</h3>
              <span className="mb-1 text-xs font-bold text-emerald-400 flex items-center gap-0.5 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                <ArrowUpRight className="w-3 h-3" /> 8.4%
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        {/* Card 3 */}
        <div className="group relative p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
            <Activity className="w-24 h-24 text-amber-500" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-amber-400 text-sm font-medium">
              <Activity className="w-4 h-4" /> Latency
            </div>
            <div className="flex items-end gap-3">
              <h3 className="text-3xl font-bold text-white tracking-tight">
                42<span className="text-lg text-slate-500 font-normal">ms</span>
              </h3>
              <span className="mb-1 text-xs font-bold text-slate-400 flex items-center gap-0.5 bg-slate-800 px-1.5 py-0.5 rounded">
                Stable
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        {/* Card 4 */}
        <div className="group relative p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-rose-500/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
            <AlertOctagon className="w-24 h-24 text-rose-500" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-rose-400 text-sm font-medium">
              <AlertOctagon className="w-4 h-4" /> Failures
            </div>
            <div className="flex items-end gap-3">
              <h3 className="text-3xl font-bold text-white tracking-tight">12</h3>
              <span className="mb-1 text-xs font-bold text-rose-400 flex items-center gap-0.5 bg-rose-400/10 px-1.5 py-0.5 rounded">
                <AlertCircle className="w-3 h-3" /> Action Req
              </span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-rose-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
      </div>

      {/* 3. MAIN DASHBOARD SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CHART SECTION */}
        <div className="lg:col-span-2 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800/50 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-400" /> Traffic Analytics
              </h3>
              <p className="text-xs text-slate-500 mt-1">Message volume vs. Active Users</p>
            </div>
            {/* Cool Tab Switcher */}
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex gap-1">
              <button className="px-3 py-1.5 rounded-lg bg-indigo-600 text-xs font-semibold text-white shadow-md">7D</button>
              <button className="px-3 py-1.5 rounded-lg hover:bg-slate-800 text-xs font-medium text-slate-400 transition">30D</button>
              <button className="px-3 py-1.5 rounded-lg hover:bg-slate-800 text-xs font-medium text-slate-400 transition">3M</button>
            </div>
          </div>
          
          <div className="flex-1 p-6 relative">
            {/* CSS-Only Cool Chart */}
            <div className="w-full h-64 flex items-end justify-between gap-3 px-2">
              
              {/* Bar 1 */}
              <div className="w-full bg-slate-800/50 rounded-t-sm relative group h-[40%] hover:h-[45%] transition-all duration-300">
                <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-indigo-600/20 to-indigo-500 rounded-t-sm opacity-60 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl">
                  Mon: 240 msgs
                </div>
              </div>

              {/* Bar 2 */}
              <div className="w-full bg-slate-800/50 rounded-t-sm relative group h-[60%] hover:h-[65%] transition-all duration-300">
                <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-indigo-600/20 to-indigo-500 rounded-t-sm opacity-60 group-hover:opacity-100 transition-opacity"></div>
              </div>

              {/* Bar 3 */}
              <div className="w-full bg-slate-800/50 rounded-t-sm relative group h-[50%] hover:h-[55%] transition-all duration-300">
                <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-indigo-600/20 to-indigo-500 rounded-t-sm opacity-60 group-hover:opacity-100 transition-opacity"></div>
              </div>

              {/* Bar 4 */}
              <div className="w-full bg-slate-800/50 rounded-t-sm relative group h-[75%] hover:h-[80%] transition-all duration-300">
                <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-cyan-600/20 to-cyan-500 rounded-t-sm opacity-80 group-hover:opacity-100 transition-opacity"></div>
              </div>

              {/* Bar 5 */}
              <div className="w-full bg-slate-800/50 rounded-t-sm relative group h-[65%] hover:h-[70%] transition-all duration-300">
                <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-indigo-600/20 to-indigo-500 rounded-t-sm opacity-60 group-hover:opacity-100 transition-opacity"></div>
              </div>

              {/* Bar 6 */}
              <div className="w-full bg-slate-800/50 rounded-t-sm relative group h-[90%] hover:h-[95%] transition-all duration-300">
                <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-indigo-600/20 to-indigo-500 rounded-t-sm opacity-60 group-hover:opacity-100 transition-opacity"></div>
              </div>

              {/* Bar 7 (Today) */}
              <div className="w-full bg-slate-800/50 rounded-t-sm relative group h-[80%] hover:h-[85%] transition-all duration-300">
                <div className="absolute bottom-0 w-full h-full bg-gradient-to-t from-purple-600/20 to-purple-500 rounded-t-sm opacity-100 group-hover:opacity-100 shadow-[0_0_15px_rgba(168,85,247,0.4)]"></div>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded z-10 shadow-xl">
                  Today
                </div>
              </div>

            </div>
            
            {/* X-Axis */}
            <div className="flex justify-between mt-4 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        </div>

        {/* HUD / SYSTEM HEALTH */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl p-6 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-400" /> System Status
          </h3>

          <div className="flex-1 space-y-6">
            {/* Item 1 */}
            <div className="group">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-slate-400 group-hover:text-emerald-400 transition-colors">API Load</span>
                <span className="text-xs font-mono text-slate-500">1,200/10k</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-[12%] shadow-[0_0_10px_rgba(16,185,129,0.5)] rounded-full relative">
                  <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/50"></div>
                </div>
              </div>
            </div>

            {/* Item 2 */}
            <div className="group">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-slate-400 group-hover:text-amber-400 transition-colors">Pending Jobs</span>
                <span className="text-xs font-mono text-slate-500">45 queued</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[45%] shadow-[0_0_10px_rgba(245,158,11,0.5)] rounded-full relative">
                  <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/50"></div>
                </div>
              </div>
            </div>

            {/* Item 3 */}
            <div className="group">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-slate-400 group-hover:text-purple-400 transition-colors">Storage</span>
                <span className="text-xs font-mono text-slate-500">8.2 GB</span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 w-[78%] shadow-[0_0_10px_rgba(168,85,247,0.5)] rounded-full relative">
                  <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/50"></div>
                </div>
              </div>
            </div>

            {/* Maintenance Alert Box */}
            <div className="mt-auto p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-700 text-slate-300">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-wide">System Log</p>
                  <p className="text-xs text-slate-500 mt-1 font-mono">
                    {`> Init sync... OK`} <br/>
                    {`> Webhook... Active`} <br/>
                    {`> `} <span className="text-emerald-500">All systems operational.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}