import { Router, Request, Response, NextFunction } from "express";
import { safeWithTimeout } from "../../../utils/util";
import controller_telegram from "../../../controller/controller_telegram";

const router = Router();
router.get("/groups", async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(controller_telegram.get_group_telegram(req, res), next);
});

router.get("/get-protects-settings", async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(controller_telegram.get_protects(req, res), next);
});

router.post("/save-protects-settings", async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(controller_telegram.add_protects(req, res), next);
});

router.delete("/delete-protects-settings", async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(controller_telegram.delete_protects(req, res), next);
});

router.put("/update-protects-settings", async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(controller_telegram.update_protects(req, res), next);
});

router.post(["/open", "/close"], async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(controller_telegram.open_close_bot(req, res), next, 20000);
});

router.post("/save", async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(controller_telegram.save_bot(req, res), next);
});

export default router;