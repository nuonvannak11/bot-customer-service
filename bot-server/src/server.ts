import express from "express";
import middlewares from "./middleware";
import { get_env } from "./utils/get_env";
import { connectRedis } from "./config/redis";
import { errorHandler } from "./middleware/errorHandler";
import connectDB from "./config/db";
import setUpRoutes from "./routes/route";
import { connectRedisSubscribe } from "./connection/connection.redis.subscribe";
import redisPublish from "./connection/connection.redis.publish";
import { get_url } from "./libs/get_urls";
import { formatDateTime } from "./utils/util";


const app = express();
const port = get_env("PORT", "3300");

app.use(express.json({ limit: '10mb' }));
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

connectRedis();
connectDB();
connectRedisSubscribe();
middlewares(app);
setUpRoutes(app);



async function auto_start() {
  redisPublish.fallbackPublish({
    url: get_url("confirm_group_chanel", get_env("SERVER_SOCKET")),
    channel: "socket:control:emit",
    message: {
      user_id: "906b00d75d305c12f2db710ef93ef3a4",
      event: "confirm:group-chanel",
      payload: {
        data_time: formatDateTime(),
        sender: {
          sender_id: "906b00d75d305c12f2db710ef93ef3a4",
          full_name: "vannak",
          user_name: "@vannak",
          type: "user"
        },
        group_chanel: {
          chatId: "353464",
          name: "hellyihl",
          type: "group",
        }
      }
    }
  });
  console.log("Start=======>");
}
// auto_start()

app.use(errorHandler);
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});