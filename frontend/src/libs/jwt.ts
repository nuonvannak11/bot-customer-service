import jwt, { SignOptions, VerifyOptions, JwtPayload } from "jsonwebtoken";
import { get_env, eLog, getRefreshToken } from "@/libs/lib";
import { empty, getErrorMessage } from "@/utils/util";
import { request_get } from "@/libs/request_server";
import { get_url } from "@/libs/get_urls";
import { ApiResponse } from "@/interface/index";
import { REQUEST_TIMEOUT_MS } from "@/constants";
import { NextResponse } from "next/server";


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

    public async verifyToken<T extends JwtPayload>(token: string, options?: VerifyOptions): Promise<{ data: T; newToken?: string } | null> {
        if (empty(token)) return null;
        try {
            const decoded = jwt.verify(token, this.JWT_SECRET, options) as T;
            return { data: decoded };
        } catch (error: unknown) {
            try {
                const err = getErrorMessage(error);
                if (err === "jwt expired") {
                    const refresh_token = await getRefreshToken();
                    console.log("refresh_token====", refresh_token)
                    if (!refresh_token) return null;
                    const response = await request_get<ApiResponse<string>>({
                        url: get_url("refresh_token"),
                        timeout: REQUEST_TIMEOUT_MS,
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${refresh_token}`,
                        },
                    });
                    if (!response.success) return null;
                    const { code, message, data } = response.data;
                    console.log("data====", data)
                    if (code !== 200) {
                        eLog("[refresh_token] Error:", message);
                        return null;
                    }
                    const decoded = jwt.verify(data, this.JWT_SECRET, options) as T;
                    return { data: decoded, newToken: data };
                }
                eLog(`Token verification failed: ${error}`);
                return null;
            } catch (err) {
                eLog(`Token verification failed: ${err}`);
                return null;
            }
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
