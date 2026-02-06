import { globalQueue } from "../queue/globalQueue";
import { eLog } from "../utils/util";

export default async function cronJob() {
    try {
        await globalQueue.add(
            "global-heartbeat",
            {},
            {
                repeat: { pattern: "* * * * *" },
                removeOnComplete: true,
                removeOnFail: true,
            }
        );
        eLog("🌍 Global cron scheduled (every minute)");
    } catch (err) {
        eLog("❌ Global cron error:", err);
    }
}
