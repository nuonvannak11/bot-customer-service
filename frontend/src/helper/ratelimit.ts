import { eLog } from "@/libs/lib";
import redis from "@/libs/redis";
import { createHash } from "crypto";

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    reset: number;
}

export class RateLimiter {
    private static readonly PREFIX = "ratelimit:";
    private static readonly LUA_SCRIPT = `
        local key = KEYS[1]
        local window = tonumber(ARGV[1])
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
    private static readonly SCRIPT_SHA = createHash("sha1").update(RateLimiter.LUA_SCRIPT).digest("hex");

    public static async check(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
        const redisKey = `${this.PREFIX}${key}`;

        try {
            let result: [number, number];
            try {
                result = await redis.evalsha(this.SCRIPT_SHA, 1, redisKey, windowSeconds) as [number, number];
            } catch (err: unknown) {
                if (err instanceof Error && err.message.includes("NOSCRIPT")) {
                    result = await redis.eval(
                        this.LUA_SCRIPT,
                        1,
                        redisKey,
                        windowSeconds
                    ) as [number, number];
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
            eLog("❌ Rate limit error:", error);
            return {
                allowed: true,
                remaining: limit,
                reset: Math.floor(Date.now() / 1000) + windowSeconds
            };
        }
    }

    public static async clear(key: string): Promise<void> {
        try {
            await redis.del(`${this.PREFIX}${key}`);
        } catch (err) {
            eLog("❌ Failed to clear rate limit:", err);
        }
    }
}