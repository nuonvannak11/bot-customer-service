import { Request } from "express";
import dotenv from 'dotenv';
dotenv.config();

export function get_env(key: string, defaultValue: string = ''): string {
    return process.env[key] || defaultValue;
}

export const getIP = (req: Request, type: "v4" | "v6" = "v4"): string => {
    let ip =
        (req.headers["cf-connecting-ip"] as string) ||
        (req.headers["x-real-ip"] as string) ||
        (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
        req.socket.remoteAddress ||
        "";

    // Remove IPv6 mapped prefix
    if (ip.startsWith("::ffff:")) {
        ip = ip.replace("::ffff:", "");
    }

    // Remove port for IPv4 and IPv6
    if (ip.includes(":")) {
        // IPv6 case: keep full address before port
        if (!/^\d+\.\d+\.\d+\.\d+/.test(ip)) {
            ip = ip.split(":")[0] || ip;
        } else {
            // IPv4 case
            ip = ip.split(":")[0];
        }
    }

    ip = ip.trim();

    // IPv4 detection
    const ipv4Regex =
        /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

    // IPv6 detection
    const ipv6Regex =
        /^(([0-9A-Fa-f]{1,4}:){1,7}[0-9A-Fa-f]{1,4}|::1)$/;

    // --- MODE SELECTOR ---
    if (type === "v4") {
        return ipv4Regex.test(ip) ? ip : "unknown";
    }

    if (type === "v6") {
        return ipv6Regex.test(ip) ? ip : "unknown";
    }

    return "unknown";
};
