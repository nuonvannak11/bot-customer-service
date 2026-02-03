import { Request, Response } from "express";
import http from "http";
import { empty } from "../utils/util";
import { getIP } from "../helper/get_ip";
import check_jwt from "../helper/check_jwt";
import { JWTPayload } from "../interface/index";

export function check_header(request: Request) {
    const cookie = request.get("cookie");
    const origin = request.get("origin");
    const ua = request.get("user-agent");
    const ip = getIP(request);
    if (ip == "127.0.0.1") return true;
    if (empty(cookie)) return false;
    if (empty(origin)) return false;
    if (empty(ua)) return false;
    // if (origin !== get_env("NEXT_ORIGIN")) return false;
    const badUA = ["python-requests", "curl", "wget", "axios", "fetch", "httpclient", "scrapy", "postman", "insomnia", "http.rb", "java", "go-http-client", "node-fetch", "okhttp"];
    if (ua) {
        const lowerUA = ua.toLowerCase();
        if (badUA.some(bad => lowerUA.includes(bad))) {
            return false;
        }
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

export const httpAgent = new http.Agent({
    keepAlive: true,
    maxSockets: 100,
    maxFreeSockets: 10,
    timeout: 60000
});