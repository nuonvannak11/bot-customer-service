import redis from "../config/redis";
import {empty, format_payload, str_lower, str_val } from "../utils/util";
import { eLog } from "../libs/lib";
import { getErrorMessage } from "../helper/index";
import { FallbackPublish } from "../interface";
import { request_post } from "../helper/helper.request";

class RedisPublish {
    public async publish(channel: string, message: unknown): Promise<boolean> {
        try {
            const format_chanel = str_lower(str_val(channel));
            await redis.publish(format_chanel, format_payload(message));
            return true;
        } catch (error) {
            eLog(`[RedisPublish] Error publishing to ${channel}:`, getErrorMessage(error));
            return false;
        }
    }

    public async fallbackPublish(option: FallbackPublish): Promise<void> {
        try {
            const { channel, url, message } = option;
            if (empty(channel) || empty(message)) {
                eLog("Missing channel or message in RedisPublish.publish")
                return;
            }
            const start_publish = await this.publish(channel, message);
            if (!start_publish) {
                await request_post({
                    url,
                    headers: { "Content-Type": "application/json" },
                    data: format_payload(message),
                });
            }
        } catch (error) {
            eLog("Error: ", getErrorMessage(error));
        }
    }
}
const redisPublish = new RedisPublish();
export default redisPublish;