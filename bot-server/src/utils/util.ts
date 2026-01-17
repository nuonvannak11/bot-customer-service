
import { get_env } from "./get_env";
import { MAX_TIMEOUT } from "../constants";
import crypto from "crypto";

export function empty(data: any): boolean {
    if (data == null) return true;
    const type = typeof data;
    switch (type) {
        case "string":
            return data.trim().length === 0;
        case "boolean":
            return false;
        case "number":
            return Number.isNaN(data);
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

export function str_lower(str: string): string {
    if (!str) return "";
    return str.toLowerCase();
}

export function generate_string(): string {
    return crypto.randomBytes(16).toString("hex");
}

export function str_number(value: unknown, fallback = 0): number {
    if (value === null || value === undefined) return fallback;
    const num = Number(value);
    if (isNaN(num) || !isFinite(num)) {
        return fallback;
    }
    return num;
}

export function format_phone(phone: unknown): string {
    if (typeof phone !== "string" || phone.trim() === "") return "";
    const trimmed = phone.trim();
    if (!trimmed.startsWith("+")) {
        return trimmed;
    }
    const withoutPlus = trimmed.slice(1);
    const match = withoutPlus.match(/^(\d{1,3})(\d+)$/);
    if (!match) return trimmed;
    const local = match[2];
    return "0" + local;
}
