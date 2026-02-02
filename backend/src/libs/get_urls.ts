import { get_env } from "../utils/get_env";

export function get_url(page: string) {
    switch (page) {
        case "close_bot":
            return get_env("SERVER_BOT_URL") + "/api/bot/stop";

        case "open_bot":
            return get_env("SERVER_BOT_URL") + "/api/bot/start";
        default:
            return "index";
    }
}