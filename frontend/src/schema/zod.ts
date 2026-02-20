import z from "zod";
import { hashKeyRegex } from "@/constants";

export const hashKeySchema = z.string().min(10).max(200).regex(hashKeyRegex, "Invalid hash format");