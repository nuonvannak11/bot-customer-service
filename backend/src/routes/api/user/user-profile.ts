import { Router, Request, Response, NextFunction } from "express";
import { safeWithTimeout } from "../../../utils/util";
import controller_user from "../../../controller/controller_user";  

const router = Router();

router.patch("/update", async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(controller_user.update_profile(req, res), next);
});

export default router;