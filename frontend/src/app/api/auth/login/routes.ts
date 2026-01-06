import { NextResponse } from "next/server";
import axios from "axios";
import { z } from "zod";
import { get_env, eLog } from "@/libs/lib";
import HashData from "@/helper/hash_data";

const LoginSchema = z.object({
    phone: z.string().min(1, "Phone is required").max(15, "Phone is too long"),
    password: z.string().min(1, "Password is required").max(20, "Password is too long"),
}).strict();

export async function POST(req: Request) {
    try {
        const body = LoginSchema.parse(await req.json());
        const { phone, password } = body;
        const ApiUrl = get_env("BACKEND_URL");
        const payload = HashData.encryptData(JSON.stringify({ phone, password }));
        const response = await axios.post(
            `${ApiUrl}/auth/login`,
            { payload },
            {
                timeout: 10_000,
                headers: { "Content-Type": "application/json" },
            }
        );
        return NextResponse.json(response.data);

    } catch (err) {
        const validate = () => {
            const error = [];
            if (err instanceof z.ZodError) {
                error.push({ code: 400, status: 200, message: err.errors[0].message });
            } else if (axios.isAxiosError(err) && err.code === "ECONNABORTED") {
                error.push({ code: 408, status: 200, message: "Request timeout (10s)" });
            } else if (axios.isAxiosError(err) && err.response) {
                error.push({ code: err.response.status, status: 200, message: err.response.statusText });
            } else {
                error.push({ code: 500, status: 200, message: "Invalid request" });
            }
            return error;
        }
        const errors = validate();
        if (errors.length > 0) {
            return NextResponse.json(errors[0]);
        }
    }
}
