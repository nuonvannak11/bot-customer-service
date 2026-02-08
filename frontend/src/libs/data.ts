import { eLog } from "@/libs/lib";
import { getServerToken } from "@/libs/lib";
import { redirect } from "next/navigation";
import controller_telegram from "@/controller/controller_telegram";
import { ProtectData } from "@/interface/telegram/interface.telegram";

export async function getDashboardStats() {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return {
    users: "12,345",
    revenue: "$45,231",
    activeAlerts: 7,
    messages: 892,
    recentActivity: [
      { id: 1, title: "New page created", desc: "Marketing landing page created.", time: "2 hours ago", type: "plus" },
      { id: 2, title: "Deployment completed", desc: "v2.4.0 patch deployed.", time: "5 hours ago", type: "check" },
      { id: 3, title: "Security rule updated", desc: "Alert threshold updated.", time: "Yesterday", type: "alert" },
    ]
  };
}

export async function getPages() {
  return [
    { id: "p1", name: "Home Landing", slug: "home", status: "published", date: "Oct 24, 2023" },
    { id: "p2", name: "Pricing", slug: "pricing", status: "draft", date: "Oct 22, 2023" },
  ];
}

export async function getAlertRules() {
  return [
    { id: "r1", name: "Server CPU > 90%", severity: "Critical", channel: "Telegram", active: true },
    { id: "r2", name: "Revenue Dip > 20%", severity: "Medium", channel: "Email", active: false },
  ];
}

export async function getTelegramData() {
  return {
    botName: "NexusBot",
    username: "@nexus_admin_bot",
    status: "Active",
    chats: [
      { id: 1, name: "John Doe", lastMsg: "Hello, I need help...", time: "2m" },
      { id: 2, name: "Sokha", lastMsg: "Can you check my order?", time: "1h" },
    ]
  };
}

export async function getFacebookData() {
  return {
    pageName: "Nexus Official",
    messages: [
      { id: 1, user: "Mike Ross", text: "Is this item available?", time: "10 min ago" },
      { id: 2, user: "Dara", text: "Can I change delivery address?", time: "1 hour ago" },
    ]
  };
}

export async function getReportStats() {
  return {
    newUsers: { value: "1,284", change: "+8%" },
    messages: { value: "4,102", change: "-2%" },
    alerts: { value: "19", change: "+12%" }
  };
}

export async function getSettings() {
  return {
    general: {
      workspaceName: "Nexus HQ",
      timezone: "Asia/Phnom_Penh",
    },
    security: {
      twoFactor: true,
      blockUnknownIPs: false,
    },
    telegram: {
      botToken: "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11",
      botName: "My Awesome Bot",
      botUsername: "@MyAwesomeBot",
      botId: "1234567890",
      contacts: 0,
      avatar: "https://example.com/avatar.png"
    }
  };
}

export async function getProtects(): Promise<ProtectData> {
  const token = await getServerToken();
  if (!token) redirect("/login");
  try {
    const data = await controller_telegram.get_protects(token);
    return data ?? { groupChannel: [], threatLogs: [] };
  } catch (error) {
    eLog("Failed to fetch protects:", error);
    return { groupChannel: [], threatLogs: [] };
  }
}
