import crypto from "crypto";
import { get_env } from "../utils/get_env";
import { empty } from "../utils/util";

class HashKey {
    private Algorithm = "aes-256-cbc";
    private SECRET_KEY: Buffer;
    private SECRET_IV: Buffer;

    constructor() {
        const key = get_env("SECRET_KEY");
        const iv = get_env("SECRET_IV");
        this.SECRET_KEY = crypto.createHash("sha256").update(key).digest();
        this.SECRET_IV = crypto.createHash("sha256").update(iv).digest().subarray(0, 16);
    }

    public encrypt(data: string): string {
        if (empty(data)) return "";
        try {
            const cipher = crypto.createCipheriv(this.Algorithm, this.SECRET_KEY, this.SECRET_IV);
            let encrypted = cipher.update(data, "utf8", "base64");
            encrypted += cipher.final("base64");
            return encrypted;
        } catch (error) {
            return "";
        }
    }

    public decrypt(encryptedData: string): string {
        if (empty(encryptedData)) return "";
        try {
            const decipher = crypto.createDecipheriv(this.Algorithm, this.SECRET_KEY, this.SECRET_IV);
            let decrypted = decipher.update(encryptedData, "base64", "utf8");
            decrypted += decipher.final("utf8");
            return decrypted;
        } catch (error) {
            return "";
        }
    }
}

export default new HashKey();
