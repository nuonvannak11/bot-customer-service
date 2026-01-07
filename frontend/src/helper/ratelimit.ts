import { eLog } from "@/libs/lib";
import redis from "@/libs/redis";
import { createHash } from "crypto";

interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    reset: number;
}

const RATE_LIMIT_LUA_SCRIPT = `
  local key = KEYS[1]
  local limit = tonumber(ARGV[1])
  local window = tonumber(ARGV[2])
  local current = redis.call("INCR", key)

  if current == 1 then
    redis.call("EXPIRE", key, window)
  end

  local ttl = redis.call("TTL", key)
  
  if ttl < 0 then
    redis.call("EXPIRE", key, window)
    ttl = window
  end

  return {current, ttl}
`;
const SCRIPT_SHA = createHash("sha1").update(RATE_LIMIT_LUA_SCRIPT).digest("hex");

export async function rate_limit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
    const redisKey = `ratelimit:${key}`;
    let result: [number, number] | null = null;
    try {
        try {
            result = await redis.evalsha(SCRIPT_SHA, 1, redisKey, limit, windowSeconds) as [number, number];
        } catch (err: any) {
            if (err.message && err.message.includes("NOSCRIPT")) {
                result = await redis.eval(RATE_LIMIT_LUA_SCRIPT, 1, redisKey, limit, windowSeconds) as [number, number];
            } else {
                throw err;
            }
        }
        const [current, ttl] = result;
        return {
            allowed: current <= limit,
            remaining: Math.max(0, limit - current),
            reset: Math.floor(Date.now() / 1000) + ttl
        };
    } catch (error) {
        eLog("Rate limit error:", error);
        return {
            allowed: true,
            remaining: limit,
            reset: Math.floor(Date.now() / 1000) + windowSeconds
        };
    }
}

export async function clearRateLimit(key: string) {
    try {
        await redis.del(`ratelimit:${key}`);
    } catch (err) {
        eLog("Failed to clear rate limit:", err);
    }
}