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

function sanitizeTelegramBody(input: Record<string, unknown>) {
  const clean: Record<string, unknown> = {};
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

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json(
        { code: 400, message: "Invalid payload", data: [] },
        { status: 400 }
      );
    }

    const ApiUrl = get_env("BACKEND_URL") || get_env("BACKEND_API_URL");

    if (!ApiUrl) {
      return NextResponse.json(
        { code: 500, message: "Backend URL is not configured", data: [] },
        { status: 500 }
      );
    }

    const safeBody = sanitizeTelegramBody(body as Record<string, unknown>);

    if (Object.keys(safeBody).length === 0) {
      return NextResponse.json(
        { code: 400, message: "No valid fields provided", data: [] },
        { status: 400 }
      );
    }

    const payload = HashData.encryptData(JSON.stringify(safeBody));
    const res = await fetch(`${ApiUrl}/telegram/setting`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload }),
    });

    const data = await res.json().catch(() => ({
      code: 502,
      message: "Invalid backend response",
      data: [],
    }));

    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        code: 500,
        message: err instanceof Error ? err.message : "Invalid request",
        data: [],
      },
      { status: 500 }
    );
  }
}
