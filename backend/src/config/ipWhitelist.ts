import { Request, Response, NextFunction } from "express";
import { getIP } from "../utils/util";

export const allowIP = (allowedIPs: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const clientIP = getIP(req, "v4");
        console.log("Client IP:", clientIP);
        if (!allowedIPs.includes(clientIP)) {
            return res.status(403).json({
                message: "Access denied: your IP is not allowed",
            });
        }
        next();
    };
};
