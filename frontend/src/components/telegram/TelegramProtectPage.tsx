"use client";

import React, { useState } from "react";
import {
    Shield, ShieldAlert, ShieldCheck, FileWarning,
    Link2Off, MessageSquareOff, Plus, Trash2,
    X, Activity, Lock, Save
} from "lucide-react";
import clsx from "clsx";

export default function TelegramProtectPage(protect: any) {
    // --- Mock State for Protection Rules ---
    const [blockedExtensions, setBlockedExtensions] = useState([".exe", ".bat", ".sh", ".vbs", ".jar"]);
    const [blacklistedDomains, setBlacklistedDomains] = useState(["scam-site.com", "free-money.org", "phishing.net"]);
    const [newExt, setNewExt] = useState("");
    const [newDomain, setNewDomain] = useState("");

    // --- Mock Data for Logs ---
    const threatLogs = [
        { id: 1, user: "BadGuy_99", type: "File", content: "free_nitro.exe", action: "Blocked", time: "10:42 AM" },
        { id: 2, user: "SpamBot_X", type: "Link", content: "http://click-me.sus", action: "Blocked", time: "10:35 AM" },
        { id: 3, user: "Unknown", type: "Spam", content: "Buy Crypto!!! Buy Crypto!!!", action: "Muted (1h)", time: "09:12 AM" },
        { id: 4, user: "ScriptKiddie", type: "Injection", content: "<script>alert('hack')</script>", action: "Ban", time: "Yesterday" },
    ];

    // Handlers
    const addExtension = () => {
        if (newExt && !blockedExtensions.includes(newExt)) {
            setBlockedExtensions([...blockedExtensions, newExt.startsWith(".") ? newExt : `.${newExt}`]);
            setNewExt("");
        }
    };

    const addDomain = () => {
        if (newDomain && !blacklistedDomains.includes(newDomain)) {
            setBlacklistedDomains([...blacklistedDomains, newDomain]);
            setNewDomain("");
        }
    };

    const removeExtension = (ext: string) => {
        setBlockedExtensions(blockedExtensions.filter(e => e !== ext));
    };

    const removeDomain = (domain: string) => {
        setBlacklistedDomains(blacklistedDomains.filter(d => d !== domain));
    };

    return (
        <div className="space-y-6 p-2 lg:p-0">

            {/* 1. HERO / STATUS HUD */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 lg:p-8">
                {/* Background Glows */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-emerald-500/30 rounded-full blur animate-pulse"></div>
                            <div className="relative w-20 h-20 bg-slate-950 border-2 border-emerald-500/50 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                <ShieldCheck size={40} className="text-emerald-400" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">System Secured</h1>
                            <p className="text-slate-400 text-sm mt-1">Real-time protection is <span className="text-emerald-400 font-bold">ACTIVE</span></p>
                            <div className="flex gap-4 mt-3 text-xs font-mono text-slate-500">
                                <span className="flex items-center gap-1"><Activity size={12} /> Uptime: 99.9%</span>
                                <span className="flex items-center gap-1"><Shield size={12} /> Rules: {blockedExtensions.length + blacklistedDomains.length + 4}</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex gap-4">
                        <div className="px-5 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Threats Blocked</p>
                            <p className="text-2xl font-black text-rose-400 mt-1">1,204</p>
                        </div>
                        <div className="px-5 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-center">
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Safe Files</p>
                            <p className="text-2xl font-black text-emerald-400 mt-1">84.2k</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. CONFIGURATION GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* FILE PROTECTION MODULE */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg flex flex-col">
                    <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
                                <FileWarning size={20} className="text-rose-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">File Guard</h3>
                                <p className="text-xs text-slate-500">Block malicious executables</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">Active</span>
                        </div>
                    </div>

                    <div className="p-5 flex-1 space-y-4">
                        {/* Input Area */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newExt}
                                onChange={(e) => setNewExt(e.target.value)}
                                placeholder="Add extension (e.g. .apk)"
                                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-rose-500/50 transition"
                            />
                            <button
                                onClick={addExtension}
                                className="bg-rose-600 hover:bg-rose-500 text-white px-4 rounded-lg flex items-center justify-center transition"
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        {/* Tags List */}
                        <div className="flex flex-wrap gap-2">
                            {blockedExtensions.map((ext) => (
                                <span key={ext} className="flex items-center gap-1 pl-3 pr-2 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono group hover:bg-rose-500/20 transition cursor-default">
                                    {ext}
                                    <button onClick={() => removeExtension(ext)} className="p-0.5 hover:bg-rose-500/30 rounded-full transition"><X size={12} /></button>
                                </span>
                            ))}
                        </div>

                        <p className="text-xs text-slate-500 italic mt-2">
                            * All files matching these extensions will be auto-deleted.
                        </p>
                    </div>
                </div>

                {/* LINK PROTECTION MODULE */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg flex flex-col">
                    <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                                <Link2Off size={20} className="text-amber-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Link Sentry</h3>
                                <p className="text-xs text-slate-500">Anti-phishing & scam filter</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">Active</span>
                        </div>
                    </div>

                    <div className="p-5 flex-1 space-y-4">
                        {/* Input Area */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newDomain}
                                onChange={(e) => setNewDomain(e.target.value)}
                                placeholder="Add domain (e.g. scam.com)"
                                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-600 outline-none focus:border-amber-500/50 transition"
                            />
                            <button
                                onClick={addDomain}
                                className="bg-amber-600 hover:bg-amber-500 text-white px-4 rounded-lg flex items-center justify-center transition"
                            >
                                <Plus size={18} />
                            </button>
                        </div>

                        {/* Tags List */}
                        <div className="flex flex-wrap gap-2">
                            {blacklistedDomains.map((domain) => (
                                <span key={domain} className="flex items-center gap-1 pl-3 pr-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono group hover:bg-amber-500/20 transition cursor-default">
                                    {domain}
                                    <button onClick={() => removeDomain(domain)} className="p-0.5 hover:bg-amber-500/30 rounded-full transition"><X size={12} /></button>
                                </span>
                            ))}
                            <span className="flex items-center gap-1 pl-3 pr-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-mono opacity-50">
                                + 1,402 Global Blacklist
                            </span>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <div className="w-8 h-4 bg-slate-700 rounded-full relative cursor-pointer">
                                <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-slate-400 rounded-full"></div>
                            </div>
                            <span className="text-xs text-slate-400">Block ALL links from non-admins</span>
                        </div>
                    </div>
                </div>

                {/* SPAM / FLOOD PROTECTION (Full Width on Mobile) */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
                    <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                <MessageSquareOff size={20} className="text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">Spam Aegis</h3>
                                <p className="text-xs text-slate-500">Rate limiting and flood control</p>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-lg shadow-indigo-500/20">
                            <Save size={14} /> Save Config
                        </button>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* Setting 1 */}
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <label className="text-sm font-medium text-slate-300">Message Rate Limit</label>
                                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 rounded">5 / 3s</span>
                            </div>
                            <input type="range" className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                            <p className="text-[11px] text-slate-500">Max messages per user every 3 seconds.</p>
                        </div>

                        {/* Setting 2 */}
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <label className="text-sm font-medium text-slate-300">Duplicate Text</label>
                                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 rounded">Strict</span>
                            </div>
                            <input type="range" className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                            <p className="text-[11px] text-slate-500">Block identical messages sent repeatedly.</p>
                        </div>

                        {/* Setting 3 */}
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <label className="text-sm font-medium text-slate-300">New User Restriction</label>
                                <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 rounded">24h</span>
                            </div>
                            <input type="range" className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                            <p className="text-[11px] text-slate-500">Disable media/links for new members.</p>
                        </div>

                    </div>
                </div>

            </div>

            {/* 3. RECENT THREAT LOGS */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <ShieldAlert size={18} className="text-rose-500" /> Security Logs
                    </h3>
                    <button className="text-xs text-slate-500 hover:text-white transition">View All</button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-950 text-slate-500 font-medium border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-3">Time</th>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Threat Type</th>
                                <th className="px-6 py-3">Content</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                            {threatLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{log.time}</td>
                                    <td className="px-6 py-4 font-medium text-white">{log.user}</td>
                                    <td className="px-6 py-4">
                                        <span className={clsx(
                                            "px-2 py-1 rounded text-xs font-bold border",
                                            log.type === "File" && "bg-rose-500/10 border-rose-500/20 text-rose-400",
                                            log.type === "Link" && "bg-amber-500/10 border-amber-500/20 text-amber-400",
                                            log.type === "Spam" && "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
                                            log.type === "Injection" && "bg-red-600/10 border-red-600/20 text-red-500",
                                        )}>
                                            {log.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-slate-400 truncate max-w-[200px]">{log.content}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="flex items-center justify-end gap-1 text-emerald-400 text-xs font-bold">
                                            <Lock size={12} /> {log.action}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}