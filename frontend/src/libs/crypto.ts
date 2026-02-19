import crypto from "crypto";
import { eLog, get_env } from "@/libs/lib";
import { empty } from "@/utils/util";

class CryptoService {
    private ALGORITHM = "aes-256-cbc";
    private SECRET_KEY = crypto.createHash("sha256").update(get_env("SECRET_KEY")).digest();
    private IV_LENGTH = 16;

    public encrypt(data: string): string | null {
        if (empty(data)) return null;
        try {
            const iv = crypto.randomBytes(this.IV_LENGTH);
            const cipher = crypto.createCipheriv(
                this.ALGORITHM,
                this.SECRET_KEY,
                iv
            );
            let encrypted = cipher.update(data, "utf8", "base64");
            encrypted += cipher.final("base64");
            return iv.toString("base64") + ":" + encrypted;
        } catch (error: unknown) {
            eLog("Error encrypting data:", error);
            return null;
        }
    }

    public decrypt(encryptedData: string): string | null {
        if (empty(encryptedData)) return null;
        try {
            const [ivBase64, encryptedText] = encryptedData.split(":");
            if (!ivBase64 || !encryptedText) return null;
            const iv = Buffer.from(ivBase64, "base64");
            const decipher = crypto.createDecipheriv(
                this.ALGORITHM,
                this.SECRET_KEY,
                iv
            );
            let decrypted = decipher.update(encryptedText, "base64", "utf8");
            decrypted += decipher.final("utf8");
            return decrypted;
        } catch (error: unknown) {
            eLog("Error decrypting data:", error);
            return null;
        }
    }

    public hash(data: string): string | null {
        if (empty(data)) return null;
        try {
            return crypto.createHash("sha256").update(data).digest("hex");
        } catch (error: unknown) {
            eLog("Error hashing data:", error);
            return null;
        }
    }

    public encryptObject<T>(data: T): string | null {
        if (empty(data)) return null;
        try {
            const json = JSON.stringify(data);
            return this.encrypt(json);
        } catch (error: unknown) {
            eLog("Error encrypting object:", error);
            return null;
        }
    }

    public decryptObject<T>(encryptedData: string): T | null {
        try {
            const decrypted = this.decrypt(encryptedData);
            if (!decrypted) return null;
            return JSON.parse(decrypted) as T;
        } catch (error: unknown) {
            eLog("Error decrypting object:", error);
            return null;
        }
    }

    public random_key(): string {
        return this.encrypt(crypto.randomBytes(16).toString("base64url")) || "";
    }
}

const cryptoService = new CryptoService();
export default cryptoService;
