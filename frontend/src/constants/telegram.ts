import { ProtectAction } from "@/types/type.telegram";
import { Method } from "axios";

export const ACTION_CONFIG: Record<ProtectAction, { method: Method; endpoint: string }> = {
    add: { method: "POST", endpoint: "save_protect_settings" },
    update: { method: "PUT", endpoint: "update_protect_settings" },
    delete: { method: "DELETE", endpoint: "delete_protect_settings" },
};

export const TELEGRAM_SETTING_KEYS = [
    "botUsername",
    "botToken",
    "is_process",
    "webhookUrl",
    "webhookEnabled",
    "notifyEnabled",
    "silentMode",
    "exceptionLinks",
] as const;