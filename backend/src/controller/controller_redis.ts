import e from "express";
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

    async publish(channel: string, payload: unknown): Promise<boolean> {
        try {
            const message = JSON.stringify(payload);
            await redisPublisher.publish(channel, message);
            return true;
        } catch (error) {
            eLog(`❌ Redis Publish Error [${channel}]:`, error);
            return false
        }
    }

    async sendToQueue(queueName: string, payload: unknown): Promise<{ status: boolean; message?: string }> {
        try {
            const message = JSON.stringify(payload);
            await redis.rpush(queueName, message);
            return { status: true, message: "Message queued successfully" };
        } catch (error) {
            eLog(`❌ Redis Queue Error [${queueName}]:`, error);
            return { status: false, message: "Failed to send to queue" };
        }
    }

    async getFromQueue<T>(queueName: string): Promise<T | null> {
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