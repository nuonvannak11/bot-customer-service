import express from "express";
import { get_env } from "./libs/get_env";
import { middleware } from "./middleware/middleware";
import connectDB from "./config/db";
import "./auto/mongoose_start";
import { connectRedis } from "./config/redis";
import setUpRoutes from "./routes";
import cronJob from "./cron/cron.index";
import { startSubscribe } from "./connection/connection.redis.subscribe";
// import controller_server from "./controller/controller_server";

const app = express();
const port = get_env("PORT", "3100");
const { errorHandler } = middleware;

app.use(express.json({ limit: '15mb' }));
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.'));

connectDB();
connectRedis()
middleware.main_middleware(app);
setUpRoutes(app);
startSubscribe();
cronJob();
app.use(errorHandler);
// controller_server.get_server_run_bot();
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});