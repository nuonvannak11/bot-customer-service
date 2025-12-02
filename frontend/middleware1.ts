import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { allowedHostRequest, blockTools, basicAuth } from "@/lib/utls";
import { getToken } from "next-auth/jwt";

const searchRequestMap = new Map<string, number>();
const MAX_ENTRIES = 250;

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  if (
    (blockTools(request) && !allowedHostRequest(request)) ||
    !allowedHostRequest(request)
  ) {
    return new Response(
      "Lost access to this resource. Please contact support.",
      {
        status: 403,
      }
    );
  }

  if (searchParams.has("search")) {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();
    const lastTime = searchRequestMap.get(ip) || 0;
    const diff = now - lastTime;

    if (diff < 500) {
      return new Response("Too many search requests. Slow down.", {
        status: 429,
      });
    }

    searchRequestMap.set(ip, now);
    if (searchRequestMap.size > MAX_ENTRIES) {
      const keys = Array.from(searchRequestMap.keys());
      for (let i = 0; i < 125; i++) {
        searchRequestMap.delete(keys[i]);
      }
    }
  }

  if (pathname.includes("/admin")) {
    console.log("Admin access attempt:", pathname);
    const token = await getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
    });
    console.log("Token:", token);

    const isAdminAccess = await basicAuth(request);
    console.log("Is admin access:", isAdminAccess);
    
    if (!isAdminAccess) {
      return new Response("Unauthorized", {
        status: 401,
      });
    }
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.match(/\.[^\/]+$/)
  ) {
    return NextResponse.next();
  }

  const lang = (await cookies()).get("lang")?.value || "kh";
  const match = pathname.match(/^\/(en|kh)(\/|$)/);
  const locale = match ? match[1] : lang;

  if (!/^\/(en|kh)(\/|$)/.test(pathname)) {
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/((?!static|.*\\..*|_next).*)",
};
