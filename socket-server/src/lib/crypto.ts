import crypto from "crypto";
import { get_env } from "../utils/get_env";
import { eLog } from "../utils/util";
import { empty } from "../utils/util";

class CryptoService {
    private readonly ALGORITHM = "aes-256-gcm";
    private readonly SECRET_KEY = crypto.createHash("sha256").update(get_env("SECRET_KEY")).digest();
    private readonly IV_LENGTH = 16;

    public encrypt(data: string): string | null {
        if (empty(data)) return null;

        try {
            const iv = crypto.randomBytes(this.IV_LENGTH);
            const cipher = crypto.createCipheriv(this.ALGORITHM, this.SECRET_KEY, iv);
            const encrypted = Buffer.concat([cipher.update(data, "utf8"), cipher.final()]);
            const authTag = cipher.getAuthTag();

            return `${iv.toString("base64")}:${encrypted.toString("base64")}:${authTag.toString("base64")}`;
        } catch (error: unknown) {
            eLog("❌ Error encrypting data:", error);
            return null;
        }
    }

    public decrypt(encryptedData: string): string | null {
        if (empty(encryptedData)) return null;

        try {
            const parts = encryptedData.split(":");
            if (parts.length !== 3) return null;

            const [ivBase64, encryptedText, authTagBase64] = parts;
            
            const iv = Buffer.from(ivBase64, "base64");
            const authTag = Buffer.from(authTagBase64, "base64");
            const encryptedBuffer = Buffer.from(encryptedText, "base64");

            const decipher = crypto.createDecipheriv(this.ALGORITHM, this.SECRET_KEY, iv);
            decipher.setAuthTag(authTag);

            const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
            return decrypted.toString("utf8");
        } catch (error: unknown) {
            eLog("❌ Error decrypting data:", error);
            return null;
        }
    }

    public hash(data: string): string | null {
        if (empty(data)) return null;
        try {
            return crypto.createHash("sha256").update(data).digest("hex");
        } catch (error: unknown) {
            eLog("❌ Error hashing data:", error);
            return null;
        }
    }

    public encryptObject<T>(data: T): string | null {
        if (empty(data)) return null;
        return this.encrypt(JSON.stringify(data));
    }

    public decryptObject<T>(encryptedData: string): T | null {
        try {
            const decrypted = this.decrypt(encryptedData);
            return decrypted ? (JSON.parse(decrypted) as T) : null;
        } catch (error: unknown) {
            eLog("❌ Error parsing decrypted object:", error);
            return null;
        }
    }

    public random_key(): string {
        return this.encrypt(crypto.randomBytes(32).toString("base64url")) || "";
    }

    public sessionId(): string {
        return crypto.randomBytes(8).toString("hex");
    }
}

export const cryptoService = new CryptoService();