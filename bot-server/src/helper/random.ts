import crypto from "crypto";

export function get_session_id(): string {
    return crypto.randomBytes(12).toString("hex");
}