import type { NextRequest } from 'next/server';
import net from "net";
import cloudflareIps from 'cloudflare-ips';

interface IPExtractionOptions {
    version?: IPVersion;
    returnNull?: boolean;
    requireCloudflare?: boolean;
}

type IPVersion = "v4" | "v6";

export function getIP(req: NextRequest, type: IPVersion = "v4"): string {
    const rawIP = extractRawIP(req);
    if (!rawIP) return "unknown";

    const normalizedIP = normalizeIP(rawIP);
    return validateAndReturnIP(normalizedIP, type) || "unknown";
}

export function getSecureIP(req: NextRequest): string | null {
    const directIP = req.headers.get('cf-connecting-ip');
    if (!directIP || !cloudflareIps.isCloudflare(directIP)) {
        return null;
    }
    const cfHeaders = [
        req.headers.get('cf-connecting-ip'),
        req.headers.get('true-client-ip'),
        req.headers.get('x-real-ip')
    ];
    for (const ip of cfHeaders) {
        if (ip && isValidIP(ip)) {
            return ip;
        }
    }
    return null;
}

function extractRawIP(req: NextRequest): string | null {
    const sources = [
        req.headers.get("cf-connecting-ip"),
        req.headers.get("x-real-ip"),
        req.headers.get("x-forwarded-for")?.split(",")[0]
    ];
    for (const source of sources) {
        if (source && typeof source === "string") {
            return source.trim();
        }
    }
    return null;
}

function normalizeIP(ip: string): string {
    return ip.startsWith("::ffff:") ? ip.slice(7) : ip;
}

function validateAndReturnIP(ip: string, type: IPVersion): string | null {
    if (ip === "::1") {
        return type === "v6" ? "::1" : "127.0.0.1";
    }
    const version = net.isIP(ip);
    if (type === "v4" && version === 4) return ip;
    if (type === "v6" && version === 6) return ip;
    return null;
}

function isValidIP(ip: string): boolean {
    return net.isIP(ip.trim()) !== 0;
}

export function getIPWithOptions(req: NextRequest, options: IPExtractionOptions = {}): string | null {
    const {
        version = "v4",
        returnNull = false,
        requireCloudflare = false
    } = options;
    const unknown = returnNull ? null : "unknown";
    if (requireCloudflare) {
        const secureIP = getSecureIP(req);
        if (!secureIP) return unknown;

        const validated = validateAndReturnIP(secureIP, version);
        return validated || unknown;
    }
    const rawIP = extractRawIP(req);
    if (!rawIP) return unknown;

    const normalizedIP = normalizeIP(rawIP);
    const validated = validateAndReturnIP(normalizedIP, version);
    return validated || unknown;
}