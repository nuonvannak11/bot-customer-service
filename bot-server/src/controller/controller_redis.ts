import redis, { redisPublisher } from "../config/redis";
import { eLog } from "../utils/util";

class RedisController {
    async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
        try {
            const data = JSON.stringify(value);
            if (ttlSeconds) {
                await redis.set(key, data, 'EX', ttlSeconds);
            } else {
                await redis.set(key, data);
            }
        } catch (error) {
            eLog(`❌ Redis Set Error [${key}]:`, error);
            throw error;
        }
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            const data = await redis.get(key);
            if (!data) return null;
            return JSON.parse(data) as T;
        } catch (error) {
            eLog(`❌ Redis Get Error [${key}]:`, error);
            return null;
        }
    }

    async del(key: string): Promise<number> {
        try {
            return await redis.del(key);
        } catch (error) {
            eLog(`❌ Redis Delete Error [${key}]:`, error);
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

    async publish(channel: string, payload: unknown): Promise<void> {
        try {
            const message = JSON.stringify(payload);
            await redisPublisher.publish(channel, message);
        } catch (error) {
            eLog(`❌ Redis Publish Error [${channel}]:`, error);
            throw error;
        }
    }
}

export default new RedisController();