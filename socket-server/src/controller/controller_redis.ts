import redis from "../config/redis";
import { eLog } from "../utils/util";

class RedisController {
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

    async del(key: string): Promise<number> {
        try {
            return await redis.del(key);
        } catch (error) {
            eLog(`Redis Delete Error [${key}]:`, error);
            throw error;
        }
    }

    async has(key: string): Promise<boolean> {
        const count = await redis.exists(key);
        return count === 1;
    }

    async clearAll(): Promise<void> {
        await redis.flushall();
    }
}

export default new RedisController();
