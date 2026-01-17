import { Express } from "express";
import { logger } from "./logger";
import { allowIP } from "../config/ipWhitelist";
import { corsMiddleware } from "../config/cors";

const allowedIPs = ["127.0.0.1", "::1"];

const middlewares = (app: Express) => {
    app.use(logger);
    app.use(corsMiddleware);
    // app.use(allowIP(allowedIPs));
};

export default middlewares;
