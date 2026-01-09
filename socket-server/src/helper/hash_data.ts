import crypto from "crypto";
import { empty } from "../utils/util";
import { get_env } from '../utils/get_env';

class HashData {
    private Algorithm = "aes-256-cbc";
    private SECRET_KEY: Buffer;
    private SECRET_IV: Buffer;

    constructor() {
        const key = get_env("SECRET_KEY");
        const iv = get_env("SECRET_IV");

        this.SECRET_KEY = crypto.createHash("sha256").update(key).digest();
        this.SECRET_IV = crypto.createHash("sha256").update(iv).digest().subarray(0, 16);
    }

    public encryptData(data: string): string | null {
        if (empty(data)) return null; // Fix: do not return empty string for invalid input.
        try {
            const cipher = crypto.createCipheriv(this.Algorithm, this.SECRET_KEY, this.SECRET_IV);
            let encrypted = cipher.update(data, "utf8", "hex");
            encrypted += cipher.final("hex");
            return encrypted;
        } catch (error) {
            // Fix: surface encryption failures instead of silently returning "".
            throw new Error("ENCRYPT_FAILED");
        }
    }

    public decryptData(encryptedData: string): string | null {
        if (empty(encryptedData)) return null; // Fix: avoid empty-string success for missing data.
        try {
            const decipher = crypto.createDecipheriv(this.Algorithm, this.SECRET_KEY, this.SECRET_IV);
            let decrypted = decipher.update(encryptedData, "hex", "utf8");
            decrypted += decipher.final("utf8");
            return decrypted;
        } catch (error) {
            // Fix: detect tampered ciphertext by throwing on decrypt failure.
            throw new Error("DECRYPT_FAILED");
        }
    }
}

export default new HashData;
