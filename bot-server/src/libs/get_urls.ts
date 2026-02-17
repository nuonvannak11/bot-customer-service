import { get_env } from "../utils/get_env";

export function get_url(page: string, url?: string) {
    let path;
    switch (page) {
        case "scan_file":
            path = "/api/bot/scan_file";
            break;
        case "confirm_group_chanel":
            path = "/api/bot/confirm_group_chanel";
            break;
        default:
            path = "/index";
    }
    if (url) return url + path;
    return get_env("BACKEN_URL") + path;
}