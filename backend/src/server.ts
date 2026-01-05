import express from "express";
import middlewares from "./middleware";
import { get_env } from "./utils/get_env";
import { errorHandler } from "./middleware/errorHandler";
import connectDB from "./config/db";
import setUpRoutes from "./routes";
import redisController from "./controller/controller_redis";
import Hash from "./helper/hash_data";
import { get_session_id } from "./helper/random";

const app = express();
const port = get_env("PORT", "3100");

app.use(express.json({ limit: '10mb' }));
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

connectDB();
middlewares(app);
setUpRoutes(app);

app.use(errorHandler);

app.post("/test", async (req: any, res: any, next: any) => {
  const payload = {
    user_id: "k9f2qzabcd",
    room: "user:k9f2qzabcd",
    event: "balance:update",
    session_id: get_session_id(),
    payload: { balance: 100 },
  };
  payload.user_id = Hash.encryptData(payload.user_id);
  payload.room = Hash.encryptData(payload.room);
  await redisController.publish("socket:control:emit", payload);
  res.send("ok");
  console.log("test");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
