
import { NextRequest, NextResponse } from "next/server";
import { empty, getErrorMessage, strlower } from "@/utils/util";
import { cookies } from "next/headers";
import { GroupChannel, PreparedData, ProtectData } from "@/interface/interface.telegram";
import jwtService from "./jwt";
import controller_user from "@/controller/controller_user";
import { CheckAuthResponse, EnsureUserLoginProp } from "@/interface";

export const response_data = (code: number, status: number, message: string, data: unknown) => {
    return NextResponse.json(
        {
            code: code,
            message: message,
            data: data
        },
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
    const expectedOrigin = get_env("NEXT_ORIGIN");
    if (!empty(expectedOrigin)) {
        try {
            const requestOrigin = new URL(origin as string).origin;
            const allowOrigin = new URL(expectedOrigin).origin;
            if (requestOrigin !== allowOrigin) {
                return false;
            }
        } catch {
            return false;
        }
    }
    const badUA = ["python-requests", "curl", "wget", "axios", "fetch", "httpclient", "scrapy", "postman", "insomnia", "http.rb", "java", "go-http-client", "node-fetch", "okhttp"];
    if (ua) {
        const lowerUA = ua.toLowerCase();
        if (badUA.some(bad => lowerUA.includes(bad))) {
            return false;
        }
    }
    return true;
}

export async function set_access_token(access_token: string, maxAge: number): Promise<boolean> {
    try {
        const cookieStore = await cookies();
        const isProduction = get_env("NODE_ENV") === "production";
        cookieStore.set("access_token", access_token, {
            httpOnly: true,
            secure: isProduction,
            path: "/",
            sameSite: "strict",
            maxAge,
        });
        return true;
    } catch (err: unknown) {
        eLog("❌ [set_access_token] Error:", getErrorMessage(err));
        return false;
    }
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

export function eLog(data: unknown, ...args: unknown[]): void {
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

export async function getAllCookies(): Promise<Record<string, string>> {
    const cookie = await cookies();
    const cookiesObj: Record<string, string> = {};
    cookie.getAll().forEach((cookie) => {
        cookiesObj[cookie.name] = cookie.value;
    });
    return cookiesObj;
}

export async function getCookie(name: string): Promise<string | null> {
    const cookie = await cookies();
    const value = cookie.get(name)?.value;
    if (!value) return null;
    return value;
}

export async function getServerToken(cookiesObj?: Record<string, string>): Promise<string | null> {
    const token = cookiesObj ? cookiesObj["access_token"] : await getCookie("access_token");
    return token || null;
}

export async function ensureValidToken(cookiesObj?: Record<string, string>): Promise<string | null> {
    const candidate = await getServerToken(cookiesObj);
    const ensureVerfy = await jwtService.verifyToken(candidate || "");
    if (ensureVerfy.success) return candidate;
    return null;
}

export async function ensureUserLogin(): Promise<EnsureUserLoginProp> {
    const cookiesObj = await getAllCookies();
    const token = await getServerToken(cookiesObj);
    const ensureUser = await controller_user.check_auth(token || "");
    return { user: ensureUser as CheckAuthResponse, token: token || "", cookiesObj };
}


export function prepareProtectData(data: ProtectData): PreparedData {
    const { groupChannel = [], threatLogs = [], exceptionLinks = [], exceptionFiles = [] } = data ?? {};
    return {
        exceptionLinks,
        exceptionFiles,
        group: filterChannels(groupChannel, "group"),
        channel: filterChannels(groupChannel, "channel"),
        active: filterActive(groupChannel),
        threatLogs,
    };
}

function filterActive(data: GroupChannel[] = []): GroupChannel[] {
    return data
        .filter((item) => item.allowScan)
        .sort((a, b) => b.upTime - a.upTime);
}

function filterChannels(
    channels: GroupChannel[] = [],
    type: "group" | "channel"
): GroupChannel[] {
    return channels.filter(
        (item) => item.type && strlower(item.type).includes(type) && item.allowScan === false
    );
}
