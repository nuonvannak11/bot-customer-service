
import { get_env } from "./get_env";
import { MAX_TIMEOUT } from "../constants";

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

export function str_lower(str: string): string {
    if (!str) return "";
    return str.toLowerCase();
}

export function generate_string(): string {
    const timePart = (Date.now() * 1000 + Number(process.hrtime.bigint() % 1000n))
        .toString(36)
        .slice(-6)
    const letters = "abcdefghijklmnopqrstuvwxyz"
    let randPart = ""
    for (let i = 0; i < 4; i++) {
        randPart += letters[Math.floor(Math.random() * 26)]
    }
    return timePart + randPart
}
