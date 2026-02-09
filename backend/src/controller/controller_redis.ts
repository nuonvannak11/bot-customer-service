import redis, { redisPublisher } from "../config/redis";
import { eLog } from "../utils/util";

class RedisController {
    private safeStringify(value: unknown): string {
        try {
            return JSON.stringify(value);
        } catch (err) {
            eLog("Redis stringify failed, falling back to safe serializer");
            return JSON.stringify(value, (_key, val) => {
                if (typeof val === "bigint") return val.toString();
                if (typeof val === "function") return "[Function]";
                if (typeof val === "undefined") return null;
                return val;
            });
        }
    }

    public async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
        try {
            const data = this.safeStringify(value);
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

    public async get<T>(key: string): Promise<T | null> {
        try {
            const data = await redis.get(key);
            if (!data) return null;
            return JSON.parse(data) as T;
        } catch (error) {
            eLog(`❌ Redis Get Error [${key}]:`, error);
            return null;
        }
    }

    public async del(key: string): Promise<number> {
        try {
            return await redis.del(key);
        } catch (error) {
            eLog(`❌ Redis Delete Error [${key}]:`, error);
            throw error;
        }
    }

    public async has(key: string): Promise<boolean> {
        const count = await redis.exists(key);
        return count === 1;
    }

    public async clearAll(): Promise<void> {
        await redis.flushall();
    }

    public async publish(channel: string, payload: unknown): Promise<boolean> {
        try {
            const message = JSON.stringify(payload);
            await redisPublisher.publish(channel, message);
            return true;
        } catch (error) {
            eLog(`❌ Redis Publish Error [${channel}]:`, error);
            return false
        }
    }

    public async sendToQueue(queueName: string, payload: unknown): Promise<{ status: boolean; message?: string }> {
        try {
            const message = JSON.stringify(payload);
            await redis.rpush(queueName, message);
            return { status: true, message: "Message queued successfully" };
        } catch (error) {
            eLog(`❌ Redis Queue Error [${queueName}]:`, error);
            return { status: false, message: "Failed to send to queue" };
        }
    }

    public async getFromQueue<T>(queueName: string): Promise<T | null> {
        try {
            const result = await redis.blpop(queueName, 0);
            if (!result) return null;
            return JSON.parse(result[1]) as T;
        } catch (error) {
            eLog(`❌ Redis Queue Error [${queueName}]:`, error);
            return null;
        }
    }
}

export default new RedisController();