import { Router, Application, Request, Response, NextFunction} from "express";
import controller_redis from "../controller/controller_redis";
import { safeWithTimeout } from "../utils/util";
import bot_telegram from "../bots/bot_telegram";
import controller_executor from "../controller/controller_executor";

const router = Router();

router.get("/test", async (req: Request, res: Response, next: NextFunction) => {
  const payload = {
    uer_id: "23",
    message_id: "6439993192",
  }
  await controller_redis.publish("virus_alerts", payload);
  return res.status(200).json({ message: "Success" });
});

router.get("/api/get-file-link", async (req: Request, res: Response, next: NextFunction) => {
  return await safeWithTimeout(bot_telegram.getFileLink(req, res), next);
});

router.post("/api/executor", async (req: Request, res: Response, next: NextFunction) => {
  return await safeWithTimeout(controller_executor.executor(req, res), next);
});

router.get("/api/data", async (req: Request, res: Response, next: NextFunction) => {
  return await safeWithTimeout(controller_executor.execute_data(req, res), next);
});

export default function setUpRoutes(app: Application) {
    app.use(router);
}
