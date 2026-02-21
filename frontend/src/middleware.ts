import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import i18nConfig from "../i18nConfig";
import isSupportedLocale from "@/utils/supported-locale";
import jwtService from "@/libs/jwt";
import { login_routes, protect_routes, protected_api_routes, REQUEST_TIMEOUT_MS } from "@/constants";
import { request_get } from "@/libs/request_server";
import { ApiResponse } from "../types/type";
import { get_url } from "@/libs/get_urls";
import { eLog } from "./utils/util";

export async function requestAcessToken(refresh_token: string): Promise<string | null> {
  try {
    if (!refresh_token) return null;
    const response = await request_get<ApiResponse<string>>({
      url: get_url("refresh_token"),
      timeout: REQUEST_TIMEOUT_MS,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refresh_token}`,
      },
    });
    if (!response.success) return null;
    const { code, message, data } = response.data;
    if (code !== 200) {
      eLog("[refresh_token] Error:", message);
      return null;
    }
    return data;
  } catch (err: unknown) {
    eLog("[refresh_token] Failed:", err);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const get_token = (name: string) => request.cookies.get(name)?.value;
  const isProtected = protect_routes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
  const isLogin = login_routes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );
  const isApiRoute = pathname.startsWith("/api");
  const isProtectApi = protected_api_routes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  const ensureProtectApi = isApiRoute && isProtectApi;

  let isAuthenticated = false;
  let newAccessToken: string | null = null;
  let response = NextResponse.next();

  console.log("middleware to login ====>");

  if (isProtected || isLogin || ensureProtectApi) {
    const refreshToken = get_token("refresh_token");
    const accessToken = get_token("access_token");
    if (refreshToken) {
      const verifyRefresh = await jwtService.verifyToken(refreshToken);
      if (verifyRefresh.success) {
        const verifyAccess = await jwtService.verifyToken(accessToken || "");
        if (verifyAccess.success) {
          isAuthenticated = true;
        } else if (verifyAccess.message === "jwt expired") {
          newAccessToken = await requestAcessToken(refreshToken);
          if (newAccessToken) {
            isAuthenticated = true;
          }
        }
      }
    }
  }

  if (isProtected && !isAuthenticated) {
    response = NextResponse.redirect(new URL("/login", request.url));
  } else if (isLogin && isAuthenticated) {
    response = NextResponse.redirect(new URL("/dashboard", request.url));
  } else if (ensureProtectApi && !isAuthenticated) {
    response = NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  if (newAccessToken) {
    response.cookies.set("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }

  const locale = request.cookies.get("NEXT_LOCALE")?.value;
  if (!locale || !isSupportedLocale(locale)) {
    response.cookies.set("NEXT_LOCALE", i18nConfig.defaultLocale);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
