import { Router, Application, Request, Response, NextFunction } from "express";
import { safeWithTimeout } from "../utils/util";
import controller_api from "../controller/controller_api";

const router = Router();

router.post("/api/bot/confirm_group_chanel", async (req: Request, res: Response, next: NextFunction) => {
  return await safeWithTimeout(controller_api.confirmGroup(req, res), next);
});

export default function setUpRoutes(app: Application) {
  app.use(router);
}
