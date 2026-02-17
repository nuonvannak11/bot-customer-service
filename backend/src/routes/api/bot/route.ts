import { Router, Request, Response, NextFunction } from "express";
import { safeWithTimeout } from "../../../utils/util";
import controllerFallback from "../../../controller/controller_fallback";

const router = Router();
router.post("/scan_file", async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(controllerFallback.scan_file(req, res), next);
});
router.post("/confirm_group_chanel", async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(controllerFallback.confirm_group_chanel(req, res), next);
});
export default router;