import { SignJWT, jwtVerify, JWTPayload } from "jose";
import { get_env } from "./get_env";
import { eLog } from "../libs/lib";
import { empty } from "../utils/util";
import { getErrorMessage } from "../helper";
import { ParseJWTPayload } from "../interface";

class JWTService {
    private JWT_SECRET = get_env("JWT_SECRET");
    private ACCESS_EXPIRES = get_env("JWT_ACCESS_EXPIRES") || "3m";
    private REFRESH_EXPIRES = get_env("JWT_REFRESH_EXPIRES") || "30d";
    private secret: Uint8Array;

    constructor() {
        if (!this.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing in env");
        }
        this.secret = new TextEncoder().encode(this.JWT_SECRET);
    }

    private async signToken<T extends object>(payload: T, expiresIn: string): Promise<string> {
        return await new SignJWT(payload as JWTPayload)
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime(expiresIn)
            .sign(this.secret);
    }

    public async signAccessToken<T extends object>(payload: T): Promise<string> {
        return this.signToken(payload, this.ACCESS_EXPIRES);
    }

    public async signRefreshToken<T extends object>(payload: T): Promise<string> {
        return this.signToken(payload, this.REFRESH_EXPIRES);
    }

    public async verifyToken(token: string): Promise<ParseJWTPayload | null> {
        if (empty(token)) return null;
        try {
            const { payload } = await jwtVerify(token, this.secret);
            return payload as unknown as ParseJWTPayload;
        } catch (error: unknown) {
            const err = getErrorMessage(error);
            eLog(`Token verification failed: ${err}`);
            return null;
        }
    }

    public decodeToken<T extends JWTPayload>(token: string): T | null {
        if (empty(token)) return null;
        try {
            const parts = token.split(".");
            if (parts.length !== 3) return null;

            const payload = JSON.parse(
                Buffer.from(parts[1], "base64").toString()
            );
            return payload as T;
        } catch (error: unknown) {
            eLog(`Token decoding failed: ${error}`);
            return null;
        }
    }
}

const jwtService = new JWTService();
export default jwtService;