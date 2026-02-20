import { Router, Request, Response, NextFunction } from "express";
import { safeWithTimeout } from "../../../utils/util";
import controller_r2 from "../../../controller/controller_r2";
import { middleware } from "../../../middleware/middleware";

const router = Router();

router.post("/save", middleware.upload.single("file"), async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(controller_r2.upload(req, res), next);
});

router.post("/delete", async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(controller_r2.delete(req, res), next);
});

export default router;