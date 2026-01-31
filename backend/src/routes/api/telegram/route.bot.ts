import { Router, Request, Response, NextFunction } from "express";
import { safeWithTimeout } from "../../../utils/util";
import controller_telegram from "../../../controller/controller_telegram";

const router = Router();
router.get("/groups", async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(controller_telegram.get_group_telegram(req, res), next);
});

router.get("/protects", async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(controller_telegram.protects(req, res), next);
});

router.post("/open", async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(controller_telegram.open_bot(req, res), next);
});

router.post("/save", async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(controller_telegram.save_bot(req, res), next);
});

export default router;