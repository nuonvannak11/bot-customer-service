
import { z } from "zod";

export const RequestSchema = z.object({
    payload: z.string().regex(/^[0-9a-f]+$/i, "Invalid payload").min(32).max(256)
}).strict();
