import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import i18nConfig from "./i18nConfig";
import isSupportedLocale from "@/utils/supported-locale";

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const locale = request.cookies.get("NEXT_LOCALE")?.value;

  if (locale && isSupportedLocale(locale)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.cookies.set("NEXT_LOCALE", i18nConfig.defaultLocale);
  return response;
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
