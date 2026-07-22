import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { isMarkdownEligible } from "./lib/markdown/eligibility";

const intlMiddleware = createMiddleware(routing);

// Country pilots served at clean, locale-free URLs. They must NOT go through
// next-intl's locale detection, which would 307 an English visitor from /uk to
// /en/uk. We rewrite them to the English route internally so the URL stays /uk
// (lang=en, no redirect). Exact-match only, so business slugs like /usual-cafe
// are unaffected.
const PILOT_PATHS = new Set(["/uk", "/us"]);

export default function middleware(request: NextRequest) {
  // 301 redirect www → non-www
  if (request.headers.get("host")?.startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.host = url.host.replace(/^www\./, "");
    return NextResponse.redirect(url, 301);
  }

  if (PILOT_PATHS.has(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = `/en${request.nextUrl.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Accept: text/markdown content negotiation — rewrite to markdown proxy
  const accept = request.headers.get("accept") ?? "";
  const isInternalFetch =
    request.headers.get("x-internal-markdown") === "1";
  if (
    !isInternalFetch &&
    accept.includes("text/markdown") &&
    isMarkdownEligible(request.nextUrl.pathname)
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/api/markdown";
    return NextResponse.rewrite(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api, /auth, /go (non-localized route handlers), /_next, /_vercel
    // - files with extensions (e.g. favicon.ico)
    "/((?!api|auth|go|_next|_vercel|.*\\..*).*)",
  ],
};
