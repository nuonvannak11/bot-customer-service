import jwt, { SignOptions, type VerifyOptions } from "jsonwebtoken";
import { get_env, eLog } from "@/libs/lib";
import { empty } from '@/utils/util';

class CheckJWT {
    private readonly secretKey = get_env("JWT_SECRET");

    public verifyToken(token: string, options?: VerifyOptions): unknown {
        if (empty(token)) return { status: false, decoded: null };
        try {
            const decoded = jwt.verify(token, this.secretKey, options);
            if (decoded) {
                return { status: true, decoded };
            }
            return { status: false, decoded: null };
        } catch (error) {
            eLog(`Token verification failed: ${error}`);
            return { status: false, decoded: null };
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
        } catch (error) {
            eLog(`Token decoding failed: ${error}`);
            return { status: false, decoded: null };
        }
    }

    public generateToken(payload: object, expiresIn: string | number): string {
        if (empty(payload) || empty(expiresIn)) return "";
        try {
            const options: SignOptions = { expiresIn: expiresIn as SignOptions["expiresIn"] };
            const token = jwt.sign(payload, this.secretKey, options);
            return token;
        } catch (error) {
            eLog(`Token generation failed: ${error}`);
            return "";
        }
    }
}

export default new CheckJWT;
