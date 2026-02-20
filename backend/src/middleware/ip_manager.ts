import { Request, Response, NextFunction } from "express";
import { eLog, response_data } from "../libs/lib";
import { getClientIP } from "../libs/get_ip";
import { getErrorMessage } from "../helper/index";
import { getSystemSettingModel } from "../models/model_system";

interface WhitelistSetting {
    ips: string[];
}

export class IpManager {
    private static whitelistedIps = new Set<string>([
        "127.0.0.1",
        "::1"
    ]);

    public static async init(): Promise<void> {
        try {
            const SystemSetting = getSystemSettingModel<WhitelistSetting>();
            const getWhiteListIp = await SystemSetting.findOne({ key: "whitelist" }).lean();
            if (getWhiteListIp && Array.isArray(getWhiteListIp.data?.ips)) {
                getWhiteListIp.data.ips.forEach(ip => this.whitelistedIps.add(ip));
                eLog(`✅ Auto-loaded ${getWhiteListIp.data.ips.length} IPs from database.`);
            }
        } catch (err) {
            eLog(`❌ Failed to auto-load whitelist from DB: ${getErrorMessage(err)}`);
        }
    }

    public static add(ip: string): void {
        const cleanIp = ip.trim();
        if (!this.whitelistedIps.has(cleanIp)) {
            this.whitelistedIps.add(cleanIp);
            eLog(`✅ Added IP to whitelist: ${cleanIp}`);
        }
    }

    public static remove(ip: string): void {
        const cleanIp = ip.trim();
        if (this.whitelistedIps.delete(cleanIp)) {
            eLog(`❌ Removed IP from whitelist: ${cleanIp}`);
        }
    }

    public static getAll(): string[] {
        return Array.from(this.whitelistedIps);
    }

    public static clear(): void {
        this.whitelistedIps.clear();
        this.whitelistedIps.add("127.0.0.1");
        this.whitelistedIps.add("::1");
        eLog("✅ Cleared whitelist (Localhost retained)");
    }

    public static allowIp = (req: Request, res: Response, next: NextFunction): void => {
        try {
            const clientIp = getClientIP(req);
            
            if (!clientIp || !IpManager.whitelistedIps.has(clientIp)) {
                eLog(`🚫 Blocked unauthorized IP: ${clientIp || "unknown"}`);
                response_data(res, 403, "Access denied", null);
                return;
            }
            
            next();
        } catch (err) {
            eLog(`❌ Error check ip: ${getErrorMessage(err)}`);
            response_data(res, 500, "Internal server error", null);
        }
    };

    public static isAllowed(ip: string): boolean {
        return this.whitelistedIps.has(ip);
    }
}