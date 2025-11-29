import { NextFunction, Request, Response, Router, Application } from "express";
import tiktokRoutes from "./api/tiktok";
import facebookRoutes from "./api/facebook";
import telegramRoutes from "./api/telegram";
import UserController from "../controller/controller_user";
import { safeWithTimeout } from "../utils/util";

const userController = new UserController();
const router = Router();

router.post("/login", async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(userController.login(req, res), next);
});

router.post("/register", async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(userController.register(req, res), next);
});

router.post("/google_login", async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(userController.googleLogin(req, res), next);
});

router.post("/verify_phone", async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(userController.verifyPhone(req, res), next);
});

router.post("/resend_code", async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(userController.resendCode(req, res), next);
});

router.use("/tiktok", tiktokRoutes);
router.use("/facebook", facebookRoutes);
router.use("/telegram", telegramRoutes);

export default function setUpRoutes(app: Application) {
    app.use(router);
}

