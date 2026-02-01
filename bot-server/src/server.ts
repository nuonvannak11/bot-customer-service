import express from "express";
import middlewares from "./middleware";
import { get_env } from "./utils/get_env";
import { connectRedis } from "./config/redis";
import { errorHandler } from "./middleware/errorHandler";
import connectDB from "./config/db";
import { startRealTimeListener } from "./worker/RedisListener";
import setUpRoutes from "./routes/route";


const app = express();
const port = get_env("PORT", "3300");

app.use(express.json({ limit: '10mb' }));
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

connectRedis();
connectDB();
startRealTimeListener();
middlewares(app);
setUpRoutes(app);

// async function auto_start() {
//   await bot_telegram.start("0337470ac7f5a2f158ef0a88909b03af", "6439993192:AAFoWK6d5u2-7lgFFVTGTsUd2wIN7ko45RI") // b7e3c00588a16940a82994869c904e01
// }
// auto_start()

app.use(errorHandler);
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});