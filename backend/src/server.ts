import express from "express";
import middlewares from "./middleware";
import { get_env } from "./utils/get_env";
import { errorHandler } from "./middleware/errorHandler";
import connectDB from "./config/db";
import { connectRedis } from "./config/redis";
import setUpRoutes from "./routes";
import cronJob from "./cron/cron.index";
import { startSubscribe } from "./connection/connection.redis.subscribe";
// import controller_server from "./controller/controller_server";

const app = express();
const port = get_env("PORT", "3100");

app.use(express.json({ limit: '10mb' }));
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

connectDB();
connectRedis()
middlewares(app);
setUpRoutes(app);
startSubscribe();
cronJob();
app.use(errorHandler);
// controller_server.get_server_run_bot();
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});