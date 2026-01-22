import express, { Request, Response, NextFunction, Router } from "express";
import middlewares from "./middleware";
import { get_env } from "./utils/get_env";
import redis from "./config/redis";
import { errorHandler } from "./middleware/errorHandler";
import { safeWithTimeout } from "./utils/util";
import connectDB from "./config/db";
import { eLog } from "./utils/util";
import controller_executor from "./controller/controller_executor";
import bot_telegram from "./bots/bot_telegram";


const app = express();
const port = get_env("PORT", "3300");
const router = Router();

app.use(express.json({ limit: '10mb' }));
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

connectDB();
middlewares(app);

async function auto_start() {
  await bot_telegram.start("23", "6439993192:AAFoWK6d5u2-7lgFFVTGTsUd2wIN7ko45RI")
}
auto_start()

router.post("/api/executor", async (req: Request, res: Response, next: NextFunction) => {
  return await safeWithTimeout(controller_executor.executor(req, res), next);
});

router.get("/api/data", async (req: Request, res: Response, next: NextFunction) => {
  return await safeWithTimeout(controller_executor.execute_data(req, res), next);
});

redis.on('connect', () => eLog('✅ Connected to Redis!'));
redis.on('error', (err) => eLog('❌ Redis Error:', err));

app.use(router);
app.use(errorHandler);
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
