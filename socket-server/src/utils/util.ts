import crypto from "crypto";
import { MAX_TIMEOUT } from "../constants/index";
import { get_env } from "./get_envs";

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

export function generateSessionId(): string {
    const random = crypto.randomBytes(16);
    const time = process.hrtime.bigint().toString();
    const hash = crypto.createHash("sha256").update(random).update(time).digest("hex");
    return hash.slice(0, 16);
}
