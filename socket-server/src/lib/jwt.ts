import jwt, { SignOptions, VerifyOptions, JwtPayload } from "jsonwebtoken";
import { get_env } from "../utils/get_env";
import { eLog } from "../utils/util";
import { empty } from "../utils/util";

class JWTService {
    private JWT_SECRET = get_env("JWT_SECRET");
    private ACCESS_EXPIRES = get_env("JWT_ACCESS_EXPIRES") || "15m";
    private REFRESH_EXPIRES = get_env("JWT_REFRESH_EXPIRES") || "30d";

    constructor() {
        if (!this.JWT_SECRET) {
            throw new Error("JWT_SECRET is missing in env");
        }
    }

    private signToken<T extends object>(payload: T, expiresIn: string | number): string {
        return jwt.sign(payload, this.JWT_SECRET, { expiresIn } as SignOptions);
    }

    public signAccessToken<T extends object>(payload: T): string {
        return this.signToken(payload, this.ACCESS_EXPIRES);
    }

    public signRefreshToken<T extends object>(payload: T): string {
        return this.signToken(payload, this.REFRESH_EXPIRES);
    }

    public verifyToken<T extends JwtPayload>(token: string, options?: VerifyOptions): T | null {
        if (empty(token)) return null;
        try {
            return jwt.verify(token, this.JWT_SECRET, options) as T;
        } catch (error: unknown) {
            eLog(`Token verification failed: ${error}`);
            return null;
        }
    }

    public decodeToken<T extends JwtPayload>(token: string): T | null {
        if (empty(token)) return null;
        try {
            return jwt.decode(token) as T;
        } catch (error: unknown) {
            eLog(`Token decoding failed: ${error}`);
            return null;
        }
    }
}

const jwtService = new JWTService();
export default jwtService;
