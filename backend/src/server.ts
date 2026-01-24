import express from "express";
import middlewares from "./middleware";
import { get_env } from "./utils/get_env";
import { errorHandler } from "./middleware/errorHandler";
import connectDB from "./config/db";
import { connectRedis } from "./config/redis";
import setUpRoutes from "./routes";
import redisController from "./controller/controller_redis";
import Hash from "./helper/hash_data";
import { get_session_id } from "./helper/random";
import { eLog } from "./utils/util";
import { startRealTimeListener } from "./worker/RedisListener";

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
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});