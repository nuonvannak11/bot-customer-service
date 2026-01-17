import express from "express";
import middlewares from "./middleware";
import { get_env } from "./utils/get_env";
import redis from "./config/redis";
import { errorHandler } from "./middleware/errorHandler";
import connectDB from "./config/db";
import { eLog } from "./utils/util";

const app = express();
const port = get_env("PORT", "3100");

app.use(express.json({ limit: '10mb' }));
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

connectDB();
middlewares(app);

redis.on('connect', () => eLog('✅ Connected to Redis!'));
redis.on('error', (err) => eLog('❌ Redis Error:', err));

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
