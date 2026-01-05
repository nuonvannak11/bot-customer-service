import { NextResponse } from "next/server";
import axios from "axios";
import { get_env, empty, eLog } from "@/utils/util";
import HashData from "@/helper/hash_data";

const ALLOWED_KEYS = [
  "botToken",
  "adminGroupId",
  "webhookUrl",
  "webhookEnabled",
  "notifyEnabled",
  "silentMode",
];

function sanitizeTelegramBody(input: Record<string, any>) {
  const clean: Record<string, any> = {};
  for (const key of ALLOWED_KEYS) {
    const value = input[key];
    if (empty(value)) continue;
    if (typeof value === "string" && value.length > 255) {
      eLog(`Field ${key} exceeded length limit.`);
      continue;
    }
    clean[key] = value;
  }
  return clean;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const ApiUrl = get_env("BACKEND_URL");
    const safeBody = sanitizeTelegramBody(body);

    if (Object.keys(safeBody).length === 0) {
      return NextResponse.json({
        code: 401,
        status: 200,
        message: "No valid fields provided",
      });
    }

    const post_body = HashData.encryptData(JSON.stringify(safeBody));
    const token = "ryrhgq23432";
    const res = await axios.post(
      `${ApiUrl}/api/setting/telegram/save`,
      { payload: post_body },
      {
        timeout: 10_000,
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${token}`,
        },
      }
    );
    return NextResponse.json(res.data);
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.code === "ECONNABORTED") {
      return NextResponse.json({
        code: 408,
        status: 200,
        message: "Request timeout (10s)",
      });
    }
    if (axios.isAxiosError(err) && err.response) {
      return NextResponse.json({
        code: err.response.status,
        status: err.response.status,
        message: err.response.statusText,
      });
    }
    return NextResponse.json({
      code: 500,
      status: 200,
      message: "Invalid request",
    });
  }
}
