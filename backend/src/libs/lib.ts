import { Request, Response } from "express";
import http from "http";
import { get_env } from "./get_env";
import { IpManager } from "../middleware/ip_manager";
import { getClientIP } from "./get_ip";
import { str_lower } from "../utils/util";
import { ALLOWED_UAS } from "../constants";

export function eLog(data: any, ...args: any[]): void {
    if (get_env('NODE_ENV', 'development') === 'development') {
        console.log(data, ...args);
    }
}

export function check_header(request: Request): boolean {
    const ua = str_lower(request.get("user-agent") ?? "");
    if (!ua || !ALLOWED_UAS.some(keyword => ua.includes(keyword))) {
        return false;
    }
    const ip = getClientIP(request);
    if (!ip || !IpManager.isAllowed(ip)) {
        return false;
    }
    return true;
}

export const response_data = (res: Response, code: number, message: string, data: any) => {
    return res.status(200).json({
        code: code,
        message: message,
        data: data
    });
}

export function ensureHashKey(data: unknown): data is { hash_key: string } {
    if (typeof data !== "object" || data === null) return false;
    const record = data as Record<string, unknown>;
    return typeof record.hash_key === "string";
}

export const httpAgent = new http.Agent({
    keepAlive: true,
    maxSockets: 100,
    maxFreeSockets: 10,
    timeout: 60000
});
