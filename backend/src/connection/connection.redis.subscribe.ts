import redis from "../config/redis";
import { eLog } from "../libs/lib";
import processor from "../controller/controller_process_file";
import { getErrorMessage } from "../helper/index";
import controller_telegram from "../controller/controller_telegram";

export async function startSubscribe() {
    try {
        const channels = [
            "receive_msg",
            "scan_file"
        ];
        await redis.subscribe(...channels, (err, count) => {
            if (err) {
                eLog("Failed to subscribe:", err.message);
            } else {
                eLog(`✅ Subscribed to ${count} channels:`, channels.join(", "));
            }
        });

        redis.on("message", async (channel, message) => {
            try {
                const data = JSON.parse(message);
                if (channel === "scan_file") {
                    await processor.addTask(data);
                }
            } catch (error: unknown) {
                eLog("Error in startSubscribe:", getErrorMessage(error));
            }
        });
    } catch (error: unknown) {
        eLog("Error in startSubscribe:", getErrorMessage(error));
    }
}