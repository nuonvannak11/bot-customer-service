import cron from "node-cron";
import { eLog } from "../utils/util";

export default async function cronJob() {
    try {
        cron.schedule("* * * * *", async () => { // 1min

        });
        cron.schedule('0 0 * * *', async () => { // 1day
        });
        eLog("Cron job started");
    } catch (err) {
        eLog("❌ Global cron error:", err);
    }
}
