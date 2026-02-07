import Redis from "ioredis";
import { get_env, eLog } from "@/libs/lib";

const portStr = get_env("REDIS_PORT", "6379");
const port = Number.parseInt(portStr, 10) || 6379;

const redisConfig = {
  host: get_env("REDIS_HOST", "127.0.0.1"),
  port,
  password: get_env("REDIS_PASS", ""),
  connectTimeout: 10000,
  retryStrategy(times: number) {
    if (times > 50) {
      eLog("❌ Redis: Retry limit exhausted.");
      return null;
    }
    const delay = Math.min(Math.pow(2, times) * 500, 10000);
    return delay;
  }
};

if (!global.redis) {
  global.redis = new Redis(redisConfig);
  global.redis.on("connect", () => eLog("✅ Redis Connected!"));
  global.redis.on("error", (err: unknown) => eLog("❌ Redis Error:", err));
}

const redis = global.redis;

export default redis;