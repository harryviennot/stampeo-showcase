import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  // 301 redirect www → non-www
  if (request.headers.get("host")?.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.host = url.host.replace(/^www\./, "");
    return NextResponse.redirect(url, 301);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api, /auth, /_next, /_vercel
    // - files with extensions (e.g. favicon.ico)
    "/((?!api|auth|_next|_vercel|.*\\..*).*)",
  ],
};
