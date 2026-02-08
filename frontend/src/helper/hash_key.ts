import crypto from "crypto";
import { eLog, get_env } from "@/libs/lib";
import { empty } from "@/utils/util";

const SECRET_KEY = crypto.createHash("sha256").update(get_env("SECRET_KEY")).digest();
const SECRET_IV = crypto.createHash("sha256").update(get_env("SECRET_IV")).digest().subarray(0, 16);

class HashKey {
    public encrypt(data: string): string | null{
        if (empty(data)) return null;
        try {
            const cipher = crypto.createCipheriv("aes-256-cbc", SECRET_KEY, SECRET_IV);
            let encrypted = cipher.update(data, "utf8", "base64");
            encrypted += cipher.final("base64");
            return encrypted;
        } catch (error: unknown) {
            eLog("Error encrypting data:", error);
            return null;
        }
    }

    public decrypt(encryptedData: string): string | null{
        if (empty(encryptedData)) return null;
        try {
            const decipher = crypto.createDecipheriv("aes-256-cbc", SECRET_KEY, SECRET_IV);
            let decrypted = decipher.update(encryptedData, "base64", "utf8");
            decrypted += decipher.final("utf8");
            return decrypted;
        } catch (error: unknown) {
            eLog("Error decrypting data:", error);
            return null;
        }
    }
}

const hashKey = new HashKey();
export default hashKey;

