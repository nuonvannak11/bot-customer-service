
import { NextRequest, NextResponse } from "next/server";
import { empty } from "@/utils/util";
import { cookies } from "next/headers";
import { GroupChannel, PreparedData, ProtectData } from "@/interface/telegram/interface.telegram";

export const response_data = (code: number, status: number, message: string, data: any) => {
    return NextResponse.json(
        { code: code, message: message, data: data },
        { status: status }
    );
}

export function check_header(request: NextRequest) {
    const header = request.headers;
    const cookie = header.get("cookie");
    const origin = header.get("origin");
    const ua = header.get("user-agent");
    if (empty(cookie)) return false;
    if (empty(origin)) return false;
    if (empty(ua)) return false;
    // if (origin !== get_env("NEXT_ORIGIN")) return false;
    const badUA = ["python-requests", "curl", "wget", "axios", "fetch", "httpclient", "scrapy", "postman", "insomnia", "http.rb", "java", "go-http-client", "node-fetch", "okhttp"];
    if (ua) {
        const lowerUA = ua.toLowerCase();
        if (badUA.some(bad => lowerUA.includes(bad))) {
            return false;
        }
    }
    return true;
}

export function get_env(key: string, defaultValue: string = ''): string {
    return process.env[key] || defaultValue;
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function random_number(digits: number): string {
    let result = '';
    for (let i = 0; i < digits; i++) {
        result += Math.floor(Math.random() * 10).toString();
    }
    return result;
}

export function eLog(data: any, ...args: any[]): void {
    if (get_env('NODE_ENV', 'development') === 'development') {
        console.log(data, ...args);
    }
}

export function expiresAt(minutes: number): Date {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    return now;
}

export function mask_phone(phone: string | number) {
    if (!phone) return "";
    const str = phone.toString();
    if (str.length <= 5) {
        return str;
    }
    const first3 = str.slice(0, 3);
    const last2 = str.slice(-2);
    return `${first3}***${last2}`;
}

export async function getServerToken() {
    const cookie = await cookies();
    const token = cookie.get("authToken")?.value;
    return token;
}

export function prepareProtectData(data: ProtectData): PreparedData {
    const { groupChannel, threatLogs } = data;
    return {
        group: {
            normal: filterChannels(groupChannel, "Group", false),
            active: filterChannels(groupChannel, "Group", true),
        },
        channel: {
            normal: filterChannels(groupChannel, "Channel", false),
            active: filterChannels(groupChannel, "Channel", true),
        },
        threatLogs,
    };
}

function filterChannels(channels: GroupChannel[], type: "Group" | "Channel", allowScan: boolean): GroupChannel[] {
    const filtered = channels.filter((item) => item.type === type && item.allowScan === allowScan);
    if (allowScan && filtered.length > 1) {
        return filtered.sort((a, b) => b.upTime - a.upTime);
    }
    return filtered;
}