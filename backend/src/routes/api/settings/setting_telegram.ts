import { Router, Request, Response, NextFunction } from "express";
import { safeWithTimeout } from "../../../utils/util";
import telegramController from "../../../controller/controller_telegram";

const router = Router();
router.get("/setting_bot", async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(telegramController.get_settings_bot(req, res), next);
});

router.post("/save", async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(telegramController.save_bot(req, res), next);
});

export default router;