import redis from "../config/redis";
import { eLog } from "../utils/util";
import processor from "../controller/controller_process_file";
import { VirusAlert } from "../interface";
import { getErrorMessage } from "../helper/errorHandling";

export async function startRealTimeListener() {
    try {
        const channels = ["receive_msg", "scan_file"];
        await redis.subscribe(...channels, (err, count) => {
            if (err) {
                eLog("Failed to subscribe:", err.message);
            } else {
                eLog(`✅ Subscribed to ${count} channels:`, channels.join(", "));
            }
        });

        redis.on("message", async (channel, message) => {
            if (channel === "scan_file") {
                const data = JSON.parse(message) as VirusAlert;
                await processor.addTask(data);
                eLog("data====>", data);
            }
        });
    } catch (error) {
        eLog("Error in startRealTimeListener:", getErrorMessage(error));
    }
}