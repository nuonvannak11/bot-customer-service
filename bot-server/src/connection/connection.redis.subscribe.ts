import bot_telegram from "../bots/bot_telegram";
import { redisSubscriber } from "../config/redis";
import { eLog } from "../utils/util";
import { get_env } from "../utils/get_env";

export async function connectRedisSubscribe() {
    const rawIp = get_env("IP", "127.0.0.1").trim();
    const ipKey = rawIp.replace(/\./g, "");
    const deleteChannel = `delete_message:${ipKey}`;
    const channels = [deleteChannel];
    await redisSubscriber.subscribe(...channels, (err, count) => {
        if (err) {
            eLog("Failed to subscribe:", err.message);
        } else {
            eLog(`✅ Subscribed to ${count} channels:`, channels.join(", "));
        }
    });

    redisSubscriber.on("message", async (channel, message) => {
        if (channel === deleteChannel) {
            const data = JSON.parse(message);
            const { user_id, chat_id, message_id } = data;
            try {
                await bot_telegram.deleteMessage(user_id, chat_id, message_id);
            } catch (error) {
                eLog("Error deleting message:", error);
            }
        }
    });
}