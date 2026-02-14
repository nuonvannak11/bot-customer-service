import { Request, Response } from "express";
import http from "http";
import check_jwt from "../helper/check_jwt";
import { JWTPayload } from "../interface/index";
import { get_env } from "../utils/get_env";

export function eLog(data: any, ...args: any[]): void {
    if (get_env('NODE_ENV', 'development') === 'development') {
        console.log(data, ...args);
    }
}

export function check_header(request: Request): boolean {
    const ua = request.get("user-agent");
    if (!ua) return false;
    const allow_ua = ["axios", "fetch", "node-fetch"];
    const lowerUA = ua.toLowerCase();
    return allow_ua.some(keyword => lowerUA.includes(keyword));
}

export const response_data = (res: Response, code: number, message: string, data: any) => {
    return res.status(200).json({
        code: code,
        message: message,
        data: data
    });
}


export async function checkJwtToken(token?: string): Promise<{ status: boolean; data: JWTPayload | null }> {
    if (!token) {
        return { status: false, data: null };
    }
    const verify = check_jwt.verifyToken(token, { ignoreExpiration: false });
    if (!verify.status) {
        return { status: false, data: null };
    }
    return { status: true, data: verify.decoded as JWTPayload };
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
