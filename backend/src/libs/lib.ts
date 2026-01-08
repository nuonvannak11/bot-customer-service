import { Request } from "express";
import { get_env } from "../utils/get_env";
import { empty } from "../utils/util";
import {getIP} from "../helper/get_ip";

export function check_header(request: Request) {
    const cookie = request.get("cookie");
    const origin = request.get("origin");
    const ua = request.get("user-agent");
    const ip = getIP(request);
    if(ip =="127.0.0.1") return true;
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