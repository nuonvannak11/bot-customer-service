import { z } from "zod";
import { gcmPayloadRegex } from "../constants";

export const RequestSchema = z.object({
    payload: z
        .string()
        .regex(gcmPayloadRegex, "Invalid encrypted payload format")
        .min(32)
        .max(4096)
}).strict();

export const ScanFileSchema = z.object({
    server_ip: z.string().min(1),
    port: z.string().min(1),
    user_id: z.string().min(1),
    chat_id: z.string().min(1),
    message_id: z.number(),
}).strict();

export const ConfirmGroupChanelSchema = z.object({
    server_ip: z.string().min(1),
    port: z.string().min(1),
    user_id: z.string().min(1),
    confirm_key: z.string().min(1),
}).strict();