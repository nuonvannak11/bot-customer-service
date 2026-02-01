import { NextResponse } from "next/server";
import { empty } from "@/utils/util";
import { get_env } from "@/libs/lib";
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
    if (empty(value)) {
      continue;
    }
    clean[key] = value;
  }
  return clean;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const ApiUrl = get_env("BACKEND_API_URL");
    const safeBody = sanitizeTelegramBody(body);

    if (Object.keys(safeBody).length === 0) {
      return NextResponse.json(
        { error: "No valid fields provided" },
        { status: 400 }
      );
    }

    const post_body = HashData.encryptData(JSON.stringify(safeBody));
    const res = await fetch(`${ApiUrl}/telegram/setting`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: post_body,
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 500 }
    );
  }
}
