import { Router, Request, Response, NextFunction } from "express";
import { safeWithTimeout } from "../../../utils/util";
import telegramController from "../../../controller/controller_telegram";

const router = Router();

router.post("/save", async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(telegramController.save(req, res), next);
});

export default router;