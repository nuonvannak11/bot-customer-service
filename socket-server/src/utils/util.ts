import { Request } from "express";
import dotenv from 'dotenv';
import { MAX_TIMEOUT } from "../constants/index";
dotenv.config();

export function get_env(key: string, defaultValue: any = ""): any {
    const val = process.env[key];
    const out = val ?? defaultValue;
    if (typeof defaultValue === 'number') {
        const num = Number(out);
        return Number.isNaN(num) ? defaultValue : num;
    }
    return out;
}

export const getIP = (req: Request, type: "v4" | "v6" = "v4"): string => {
    let ip =
        (req.headers["cf-connecting-ip"] as string) ||
        (req.headers["x-real-ip"] as string) ||
        (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
        req.socket.remoteAddress ||
        "";
    if (ip === "::1") {
        return "127.0.0.1";
    }
    if (ip.startsWith("::ffff:")) {
        ip = ip.replace("::ffff:", "");
    }

    if (ip.includes(":")) {
        if (!/^\d+\.\d+\.\d+\.\d+/.test(ip)) {
            ip = ip.split(":")[0] || ip;
        } else {
            ip = ip.split(":")[0];
        }
    }
    ip = ip.trim();
    const ipv4Regex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
    const ipv6Regex = /^(([0-9A-Fa-f]{1,4}:){1,7}[0-9A-Fa-f]{1,4}|::1)$/;
    if (type === "v4") {
        return ipv4Regex.test(ip) ? ip : "unknown";
    }
    if (type === "v6") {
        return ipv6Regex.test(ip) ? ip : "unknown";
    }
    return "unknown";
};

export function empty(data: any): boolean {
    if (data == null) return true;

    const type = typeof data;

    switch (type) {
        case "string":
            return data.trim().length === 0;

        case "boolean":
            return data === false;

        case "number":
            return data === 0 || Number.isNaN(data);

        case "bigint":
            return data === BigInt(0);

        case "function":
            return false;

        case "object":
            if (Array.isArray(data)) return data.length === 0;
            if (data instanceof Map || data instanceof Set) return data.size === 0;
            if (data instanceof Date) return isNaN(data.getTime());
            if (data instanceof RegExp) return false;
            return Object.keys(data).length === 0;

        default:
            return false;
    }
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

export async function safeWithTimeout<T>(
    promise: Promise<T>,
    next: (err: any) => void,
    timeout: number = MAX_TIMEOUT
): Promise<T | void> {
    const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("TIMEOUT")), timeout);
    });
    try {
        return await Promise.race([promise, timeoutPromise]);
    } catch (error: any) {
        if (error instanceof Error && error.message === "TIMEOUT") {
            throw new Error("Request timed out");
        }
        next(error);
    }
}