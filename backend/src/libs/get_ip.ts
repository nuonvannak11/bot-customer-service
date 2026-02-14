import { Request } from "express";
import net from "net";

export type IPVersion = "v4" | "v6" | "any";

export interface IPExtractionOptions {
    version?: IPVersion;
    fallback?: string | null;
}

export function getClientIP(req: Request, options: IPExtractionOptions = {}): string | null {
    const { version = "any", fallback = null } = options;
    const rawIP = extractIP(req);
    if (!rawIP) return fallback;

    const normalizedIP = normalizeIP(rawIP);
    const ipType = net.isIP(normalizedIP);
    if (ipType === 0) return fallback;
    
    if (version === "v4" && ipType !== 4) return fallback;
    if (version === "v6" && ipType !== 6) return fallback;

    return normalizedIP;
}

function extractIP(req: Request): string | null {
    const directHeaders = [
        'cf-connecting-ip',
        'true-client-ip',
        'x-real-ip'
    ];

    for (const header of directHeaders) {
        const value = req.get(header);
        if (value) return value.trim();
    }

    const forwardedFor = req.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }
    if (req.ip) return req.ip;
    if (req.socket?.remoteAddress) return req.socket.remoteAddress;

    return null;
}

function normalizeIP(ip: string): string {
    if (ip.startsWith("::ffff:")) return ip.slice(7);
    if (ip === "::1") return "127.0.0.1";
    return ip;
}