import Redis from 'ioredis';
import { get_env } from "../utils/get_env";
import { eLog } from '../utils/util';

declare global {
  var __redis__: Redis | undefined;
}

const portStr = get_env("REDIS_PORT", "6379");
const port = Number.parseInt(portStr, 10);

const redis = global.__redis__ ?? new Redis({
  host: get_env("REDIS_HOST", "127.0.0.1"),
  port: Number.isNaN(port) ? 6379 : port,
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
});

global.__redis__ = redis;

export default redis;