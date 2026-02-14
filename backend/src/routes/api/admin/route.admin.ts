import { Router, Request, Response, NextFunction } from "express";
import { safeWithTimeout } from "../../../utils/util";
import controller_admin from "../../../controller/controller_admin";

const router = Router();
router.get("/get-servers", async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(controller_admin.request_get_servers(req, res), next);
});
router.post("/add-server", async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(controller_admin.request_add_server(req, res), next);
});
router.delete("/delete-server", async (req: Request, res: Response, next: NextFunction) => {
    return await safeWithTimeout(controller_admin.request_delete_server(req, res), next);
});


export default router;