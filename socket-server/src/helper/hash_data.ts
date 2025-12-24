import crypto from "crypto";
import { empty } from "../utils/util";
import { get_env } from '../utils/get_envs';

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

    public encryptData(data: string): string {
        if (empty(data)) return "";
        try {
            const cipher = crypto.createCipheriv(this.Algorithm, this.SECRET_KEY, this.SECRET_IV);
            let encrypted = cipher.update(data, "utf8", "hex");
            encrypted += cipher.final("hex");
            return encrypted;
        } catch (error) {
            return "";
        }
    }

    public decryptData(encryptedData: string): string {
        if (empty(encryptedData)) return "";
        try {
            const decipher = crypto.createDecipheriv(this.Algorithm, this.SECRET_KEY, this.SECRET_IV);
            let decrypted = decipher.update(encryptedData, "hex", "utf8");
            decrypted += decipher.final("utf8");
            return decrypted;
        } catch (error) {
            return "";
        }
    }
}

export default new HashData;
