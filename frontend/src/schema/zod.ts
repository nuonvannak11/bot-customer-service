import z from "zod";
import { hashKeyRegex } from "@/constants";

export const hashKeySchema = z.string().min(10).max(200).regex(hashKeyRegex, "Invalid hash format");
export const isZodObject = (value: unknown): value is z.ZodObject<z.ZodRawShape> => {
    return typeof value === "object" && value !== null && "shape" in value && "safeParse" in value;
};