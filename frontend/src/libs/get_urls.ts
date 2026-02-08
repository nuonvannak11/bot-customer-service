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
            return get_env("BACKEND_URL") + "/api/telegram/bot/get-protects-settings";
        case "save_protect_settings":
            return get_env("BACKEND_URL") + "/api/telegram/bot/save-protects-settings";
        case "delete_protect_settings":
            return get_env("BACKEND_URL") + "/api/telegram/bot/delete-protects-settings";
        case "update_protect_settings":
            return get_env("BACKEND_URL") + "/api/telegram/bot/update-protects-settings";
        case "user_profile":
            return get_env("BACKEND_URL") + "/auth/get_user_profile";
        case "check_auth":
            return get_env("BACKEND_URL") + "/auth/check_auth";
        case "resend_code":
            return get_env("BACKEND_URL") + "/auth/resend_code";
        case "verify_phone":
            return get_env("BACKEND_URL") + "/auth/verify_phone";
        case "login":
            return get_env("BACKEND_URL") + "/auth/login";
        case "register":
            return get_env("BACKEND_URL") + "/auth/register";
        case "logout":
            return get_env("BACKEND_URL") + "/auth/logout";
        case "update_user_profile":
            return get_env("BACKEND_URL") + "/api/user/profile/update";
        default:
            throw new Error(`Unknown backend url key: ${name}`);
    }
}
