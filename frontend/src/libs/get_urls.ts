import { get_env } from "./lib";

export function get_url(name: string) {
    switch (name) {
        case "close_bot":
            return get_env("BACKEND_URL") + "/api/telegram/bot/close";
        case "open_bot":
            return get_env("BACKEND_URL") + "/api/telegram/bot/open";
        case "get_groups":
            return get_env("BACKEND_URL") + "/api/telegram/bot/groups";
        case "get_bot_settings":
            return get_env("BACKEND_URL") + "/api/setting/telegram/setting_bot";
        case "save_bot_settings":
            return get_env("BACKEND_URL") + "/api/setting/telegram/save";
        case "get_protect_settings":
            return get_env("BACKEND_URL") + "/api/setting/telegram/protects";
        default:
            return "index";
    }
}