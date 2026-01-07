import crypto from "crypto";
import hash_key from "@/helper/hash_key";

export function get_key(): string {
    const key = crypto.randomBytes(16).toString("base64url");
    return hash_key.encrypt(key);
}
