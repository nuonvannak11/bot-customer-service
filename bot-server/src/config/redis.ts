import Redis from 'ioredis';
import { get_env } from "../utils/get_env";
import { eLog } from '../utils/util';

const portStr = get_env("REDIS_PORT", "6379");
const port = Number.parseInt(portStr, 10);

const redisConfig = {
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
};

const redis = new Redis(redisConfig);

export const redisPublisher = new Redis(redisConfig);
export const redisSubscriber = new Redis(redisConfig);
export function connectRedis() {
  redis.on('connect', () => eLog('✅ Connected to Redis (general)!'));
  redis.on('error', (err) => eLog('❌ Redis Error (general):', err));
  
  redisPublisher.on('connect', () => eLog('✅ Connected to Redis (publisher)!'));
  redisPublisher.on('error', (err) => eLog('❌ Redis Error (publisher):', err));
  
  redisSubscriber.on('connect', () => eLog('✅ Connected to Redis (subscriber)!'));
  redisSubscriber.on('error', (err) => eLog('❌ Redis Error (subscriber):', err));
}
export default redis;