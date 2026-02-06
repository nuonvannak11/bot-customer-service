import { Worker } from "bullmq";
import { redisConfig } from "./config/redis";
import { eLog } from "./utils/util";

new Worker(
  "global-queue",
  async (job) => {
    if (job.name === "global-heartbeat") {
      // eLog("🫀 GLOBAL CRON:", new Date().toISOString());
      await runSystemCheck();
    }
  },
  { connection: redisConfig }
);

async function runSystemCheck() {
  // eLog("Checking DB & running tasks...");
}
