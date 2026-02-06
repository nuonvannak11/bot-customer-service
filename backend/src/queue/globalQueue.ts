import { Queue } from "bullmq";
import { redisConfig } from "../config/redis";

export const globalQueue = new Queue("global-queue", {
  connection: redisConfig,
});
