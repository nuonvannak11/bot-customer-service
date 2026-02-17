import { Request, Response, NextFunction } from "express";
import { eLog } from "../libs/lib";
import { getClientIP } from "../libs/get_ip";
import { getErrorMessage } from "../helper/errorHandling";

const whitelistedIps = new Set<string>([
    "127.0.0.1", 
    "::1"
]);

export function addIpToWhitelist(ip: string) {
    whitelistedIps.add(ip);
    eLog(`✅ Added IP to whitelist: ${ip}`);
}

export function removeIpFromWhitelist(ip: string) {
    whitelistedIps.delete(ip);
    eLog(`❌ Removed IP from whitelist: ${ip}`);
}

export function getWhitelistedIps(): string[] {
    return Array.from(whitelistedIps);
}

export function allowIp(req: Request, res: Response, next: NextFunction): void {
    try {
        const clientIp = getClientIP(req);
        if (!clientIp || !whitelistedIps.has(clientIp)) {
            eLog(`🚫 Blocked unauthorized IP: ${clientIp || "unknown"}`);
            res.status(403).json({
                code: 403,
                message: "Access denied"
            });
            return;
        }
        next();
    } catch (err) {
        eLog(`❌ Error check ip: ${getErrorMessage(err)}`);
        res.status(500).json({ code: 500, message: "Internal server error" });
    }
}