
import { z } from "zod";

export const loginSchema = z.object({
    phone: z.string()
        .regex(/^[0-9a-f]+$/i, "Invalid encrypted phone")
        .min(32)
        .max(256),
    password: z.string()
        .regex(/^[0-9a-f]+$/i, "Invalid encrypted password")
        .min(32)
        .max(256),
}).strict();
