import redis from "../config/redis";
import { eLog } from "../utils/util";

class RedisController {
    private readonly setIfMissingOrMatchLua = `
        local current = redis.call("GET", KEYS[1])
        if (not current) or (current == ARGV[1]) then
            redis.call("SET", KEYS[1], ARGV[1], "EX", ARGV[2])
            return 1
        end
        return 0
    `;

    async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
        try {
            const data = JSON.stringify(value);
            if (ttlSeconds) {
                await redis.set(key, data, "EX", ttlSeconds);
            } else {
                await redis.set(key, data);
            }
        } catch (error) {
            eLog(`Redis Set Error [${key}]:`, error);
            throw error;
        }
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            const data = await redis.get(key);
            if (!data) return null;
            return JSON.parse(data) as T;
        } catch (error) {
            eLog(`Redis Get Error [${key}]:`, error);
            return null;
        }
    }
    
    async getOrThrow<T>(key: string): Promise<T | null> {
        try {
            const data = await redis.get(key);
            if (!data) return null;
            return JSON.parse(data) as T;
        } catch (error) {
            eLog(`Redis Get Error [${key}]:`, error);
            throw error;
        }
    }

    async setIfNotExists(key: string, value: any, ttlSeconds?: number): Promise<boolean> {
        try {
            const data = JSON.stringify(value);
            const result = ttlSeconds
                ? await redis.set(key, data, "EX", ttlSeconds, "NX")
                : await redis.set(key, data, "NX");
            return result === "OK";
        } catch (error) {
            eLog(`Redis SetNX Error [${key}]:`, error);
            throw error;
        }
    }

    async setIfMissingOrMatch(key: string, value: string, ttlSeconds: number): Promise<boolean> {
        try {
            const data = JSON.stringify(value);
            // Fix: atomic compare-and-set to prevent session races.
            const result = await redis.eval(this.setIfMissingOrMatchLua, 1, key, data, String(ttlSeconds));
            return result === 1 || result === "1";
        } catch (error) {
            eLog(`Redis Atomic Set Error [${key}]:`, error);
            throw error;
        }
    }

    async del(key: string): Promise<number> {
        try {
            return await redis.del(key);
        } catch (error) {
            eLog(`Redis Delete Error [${key}]:`, error);
            throw error;
        }
    }

    async has(key: string): Promise<boolean> {
        try {
            const count = await redis.exists(key);
            return count === 1;
        } catch (error) {
            eLog(`Redis Exists Error [${key}]:`, error); // Fix: add try/catch around async Redis calls.
            throw error;
        }
    }

    async clearAll(): Promise<void> {
        try {
            await redis.flushall();
        } catch (error) {
            eLog("Redis FlushAll Error:", error); // Fix: add try/catch around async Redis calls.
            throw error;
        }
    }
}

export default new RedisController();
