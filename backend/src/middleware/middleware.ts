import multer from "multer";
import { Express, Request, Response, NextFunction } from "express";
import { getErrorMessage } from "../helper";
import { LIMIT_FILE_SIZE } from "../constants";
import { eLog, response_data } from "../libs/lib";
import { AuthData } from "../interface";
import { str_lower } from "../utils/util";
import jwtService from "../libs/jwt";
import { corsMiddleware } from "../config/cors";

class Middleware {
    private async extractToken(req: Request): Promise<AuthData | null> {
        const header = req.headers.authorization || req.headers.Authorization;
        if (!header || typeof header !== "string") return null;
        const [scheme, token] = header.trim().split(/\s+/);
        if (str_lower(scheme) !== "bearer" || !token) return null;
        const verify = await jwtService.verifyToken(token);
        if (!verify) return null;
        const { user_id, session_id } = verify;
        return { user_id, session_id, token };
    }

    public errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
        if (res.headersSent) {
            return next(err);
        }
        res.status(200).json({
            message: getErrorMessage(err) || "Server error",
        });
    };

    public upload = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: LIMIT_FILE_SIZE },
    });

    public logger(req: Request, res: Response, next: NextFunction) {
        eLog(`[${req.method}] ${req.originalUrl}`);
        next();
    };

    public async ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
        try {
            const authHeader = req.headers['authorization'] || req.headers['Authorization'];
            if (!authHeader) {
                response_data(res, 401, 'Access denied. No token provided.', null)
                return;
            }
            if (!await this.extractToken(req)) {
                response_data(res, 401, 'Access denied. Invalid token.', null)
                return;
            }
            next();
        } catch (error: unknown) {
            response_data(res, 500, getErrorMessage(error), null)
            return;
        }
        next();
    };

    public main_middleware(app: Express) {
        app.use(this.logger);
        app.use(corsMiddleware);
        // app.use(allowIP(allowedIPs));
    };
}
export const middleware = new Middleware();



