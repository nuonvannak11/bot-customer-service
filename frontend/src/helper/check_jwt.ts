import jwt, { SignOptions, type VerifyOptions } from "jsonwebtoken";
import { get_env, eLog } from "@/libs/lib";
import { empty } from '@/utils/util';
import { ParseJWTPayload } from "@/interface";

const JWT_SECRET = get_env("JWT_SECRET");

class CheckJWT {
    public verifyToken(token: string, options?: VerifyOptions): ParseJWTPayload | null {
        if (!token) return null;
        try {
            const decoded = jwt.verify(token, JWT_SECRET, options);
            if (decoded) return decoded as ParseJWTPayload;
            return null;
        } catch (error: unknown) {
            eLog(`Token verification failed: ${error}`);
            return null;
        }
    }

    public decodeToken(token: string): unknown {
        if (empty(token)) return { status: false, decoded: null };
        try {
            const decoded = jwt.decode(token);
            if (decoded) {
                return { status: true, decoded };
            }
            return { status: false, decoded: null };
        } catch (error: unknown) {
            eLog(`Token decoding failed: ${error}`);
            return { status: false, decoded: null };
        }
    }

    public generateToken(payload: object, expiresIn: string | number): string {
        if (empty(payload) || empty(expiresIn)) return "";
        try {
            const options: SignOptions = { expiresIn: expiresIn as SignOptions["expiresIn"] };
            const token = jwt.sign(payload, JWT_SECRET, options);
            return token;
        } catch (error: unknown) {
            eLog(`Token generation failed: ${error}`);
            return "";
        }
    }
}

const checkJwt = new CheckJWT();
export default checkJwt;

