import crypto from "crypto";
import { eLog, get_env } from "@/libs/lib";
import { empty } from "@/utils/util";

const SECRET_KEY = crypto.createHash("sha256").update(get_env("SECRET_KEY")).digest();
const SECRET_IV = crypto.createHash("sha256").update(get_env("SECRET_IV")).digest().subarray(0, 16);

class HashData {
    public encryptData(data: string): string {
        if (empty(data)) return "";
        try {
            const cipher = crypto.createCipheriv("aes-256-cbc", SECRET_KEY, SECRET_IV);
            let encrypted = cipher.update(data, "utf8", "hex");
            encrypted += cipher.final("hex");
            return encrypted;
        } catch (error: unknown) {
            eLog("Error encrypting data:", error);
            return "";
        }
    }

    public decryptData(encryptedData: string): string {
        if (empty(encryptedData)) return "";
        try {
            const decipher = crypto.createDecipheriv("aes-256-cbc", SECRET_KEY, SECRET_IV);
            let decrypted = decipher.update(encryptedData, "hex", "utf8");
            decrypted += decipher.final("utf8");
            return decrypted;
        } catch (error: unknown) {
            eLog("Error decrypting data:", error);
            return "";
        }
    }
}
const hashData = new HashData();
export default  hashData;
