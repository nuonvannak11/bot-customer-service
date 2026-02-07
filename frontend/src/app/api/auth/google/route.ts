import { NextResponse } from "next/server";
import { EXPIRE_TOKEN_TIME, GOOGLE_TOKEN_REGEX } from "@/constants";
import { get_env } from "@/libs/lib";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json(
        { code: 400, message: "Invalid payload", data: [] },
        { status: 400 }
      );
    }

    const backendUrl = get_env("BACKEND_URL") || get_env("BACKEND_API_URL");

    if (!backendUrl) {
      return NextResponse.json(
        { code: 500, message: "Backend URL is not configured", data: [] },
        { status: 500 }
      );
    }

    const res = await fetch(`${backendUrl}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const rawData = await res.json().catch(() => null);
    const data =
      typeof rawData === "object" && rawData !== null
        ? (rawData as Record<string, unknown>)
        : { code: 502, message: "Invalid backend response", data: [] };

    const response = NextResponse.json(data, { status: res.status });
    const token = typeof data.token === "string" ? data.token : "";

    if (token && GOOGLE_TOKEN_REGEX.test(token)) {
      response.cookies.set("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: EXPIRE_TOKEN_TIME,
      });
    }

    return response;
  } catch (error: unknown) {
    return NextResponse.json(
      {
        code: 500,
        message: error instanceof Error ? error.message : "Invalid request",
        data: [],
      },
      { status: 500 }
    );
  }
}
