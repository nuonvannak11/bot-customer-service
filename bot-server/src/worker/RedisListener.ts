import bot_telegram from "../bots/bot_telegram";
import { redisSubscriber } from "../config/redis";

export async function startRealTimeListener() {
    const channels = ["delete_message"];
    await redisSubscriber.subscribe(...channels, (err, count) => {
        if (err) {
            console.error("Failed to subscribe:", err.message);
        } else {
            console.log(`✅ Subscribed to ${count} channels:`, channels.join(", "));
        }
    });

    redisSubscriber.on("message", async (channel, message) => {
        if (channel === "delete_message") {
            const data = JSON.parse(message);
            const { user_id, chat_id, message_id } = data;
            try {
                await bot_telegram.deleteMessage(user_id, chat_id, message_id);
            } catch (error) {
                console.error("Error deleting message:", error);
            }
        }
    });
}