import { Request } from "express";
import net from "net";

export function getIP(req: Request, type: "v4" | "v6" = "v4"): string {
    let ip = "";
    ip =
        (req.headers["cf-connecting-ip"] as string) ||
        (req.headers["x-real-ip"] as string) ||
        (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
        req.socket.remoteAddress ||
        "";
    ip = ip.trim();
    if (ip === "::1") return type === "v6" ? "::1" : "127.0.0.1";
    if (ip.startsWith("::ffff:")) {
        ip = ip.slice(7);
    }
    const version = net.isIP(ip);
    if (type === "v4") {
        return version === 4 ? ip : "unknown";
    }
    if (type === "v6") {
        return version === 6 ? ip : "unknown";
    }
    return "unknown";
}
