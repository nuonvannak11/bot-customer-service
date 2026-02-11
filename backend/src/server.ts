import express from "express";
import middlewares from "./middleware";
import { get_env } from "./utils/get_env";
import { errorHandler } from "./middleware/errorHandler";
import connectDB from "./config/db";
import { connectRedis } from "./config/redis";
import setUpRoutes from "./routes";
import { startRealTimeListener } from "./publish/RedisListener";
import cronJob from "./cron/cron.index";

const app = express();
const port = get_env("PORT", "3100");

app.use(express.json({ limit: '10mb' }));
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

connectDB();
connectRedis()
middlewares(app);
setUpRoutes(app);
startRealTimeListener();
cronJob();
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});