import z from "zod";
import { PHONE_REGEX, SAFE_TEXT } from "@/constants";
import { hashKeySchema } from "./zod";

export const JSON_PROTECTOR = {
    phone: z.string().min(7, "Phone is required").max(15, "Phone is too long").regex(PHONE_REGEX, "Invalid phone number format").transform((v) => v.replace(/\D/g, "")),
    password: z.string().min(1, "Password is required").max(20, "Password is too long").regex(SAFE_TEXT, "Invalid characters!").transform((v) => v.trim()),
    hash_key: hashKeySchema
};

export const SchemaUpdateUserProfile = z.object(JSON_PROTECTOR).omit({ password: true, phone: true }).extend({
    isAvatarUpdated: z.string().optional(),
    avatar: z.string().optional(),
    fullName: z.string().optional(),
    username: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    bio: z.string().optional(),
    emailNotifications: z.string().optional(),
    twoFactor: z.string().optional(),
}).strict();