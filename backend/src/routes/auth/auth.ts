import { NextFunction, Request, Response, Router } from "express";
// import googleCallback from "./auth/google/callback";
import userController from "../../controller/controller_user";
import { safeWithTimeout } from "../../utils/util";

const router = Router();

router.get("/get_user_profile", async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(userController.get_user_profile(req, res), next);
});

router.get("/refresh_token", async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(userController.checkRefreshToken(req, res), next);
});

router.get("/check_auth", async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(userController.checkAccessToken(req, res), next);
});

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

export default router;