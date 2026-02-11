import cron from "node-cron";
import { eLog } from "../utils/util";

export default async function cronJob() {
    try {
        cron.schedule("* * * * *", async () => {

        });
        eLog("Cron job started");
    } catch (err) {
        eLog("❌ Global cron error:", err);
    }
}
