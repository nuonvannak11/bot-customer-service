import Redis from "ioredis";
import { eLog } from "../utils/util";
import { get_env } from '../utils/get_env';

const port = get_env("REDIS_PORT", 6379);

const redis = new Redis({
    host: get_env("REDIS_HOST", "127.0.0.1"),
    port: Number.isNaN(port) ? 6379 : port,
    password: get_env("REDIS_PASS", ""),
    connectTimeout: 10000,
});

redis.on("connect", () => eLog("Connected to Redis"));
redis.on("ready", () => eLog("Redis ready")); // Fix: track readiness for reconnect recovery.
redis.on("reconnecting", () => eLog("Redis reconnecting")); // Fix: reconnect handler for observability.
redis.on("end", () => eLog("Redis connection end")); // Fix: detect disconnects.
redis.on("close", () => eLog("Redis connection close")); // Fix: detect socket closure.
redis.on("error", (err) => eLog("Redis Error:", err));

export default redis;
