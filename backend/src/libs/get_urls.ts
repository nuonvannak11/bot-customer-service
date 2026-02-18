import { get_env } from "../utils/get_env";

export function get_url(page: string, url?: string) {
    let path;
    switch (page) {
        case "close_bot":
            path = "/api/bot/stop";
            break;
        case "open_bot":
            path = "/api/bot/start";
            break;
        case "delete_message":
            path = "/api/bot/delete_message";
            break;
        case "get_bot_file_link":
            path = "/api/bot/get_file_link";
            break;
        default:
            path = "index";

            
    }
    if (url) return url + path;
    return get_env("SERVER_BOT_URL") + path;
}