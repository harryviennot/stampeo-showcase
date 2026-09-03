import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { createBusinessLocaleLookup } from "./lib/business-locale";
import { isMarkdownEligible } from "./lib/markdown/eligibility";
import {
  acquisitionSlug,
  isSupportedLocale,
  matchAcceptLanguage,
  resolveAcquisitionLocale,
} from "./lib/locale-negotiation";

const intlMiddleware = createMiddleware(routing);

const getBusinessLocale = createBusinessLocaleLookup({
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
});

// Country pilots served at clean, locale-free URLs. They must NOT go through
// next-intl's locale detection, which would 307 an English visitor from /uk to
// /en/uk. We rewrite them to the English route internally so the URL stays /uk
// (lang=en, no redirect). Exact-match only, so business slugs like /usual-cafe
// are unaffected.
const PILOT_PATHS = new Set(["/uk", "/us"]);

export default async function middleware(request: NextRequest) {
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

  const slug = acquisitionSlug(request.nextUrl.pathname);
  if (slug) return acquisitionResponse(request, slug);

  return intlMiddleware(request);
}

/**
 * Serve a QR-code enrollment URL in the right language.
 *
 * `/{slug}` carries no locale, so next-intl would fall back to the site default
 * (French) for anyone whose browser did not ask for a language we serve — which
 * is how a Polish customer in a Polish shop ended up reading French. We resolve
 * it ourselves instead, ending on the shop's own `primary_locale`.
 *
 * A rewrite rather than a redirect, for two reasons: the printed URL stays the
 * clean one the merchant handed out, and a per-visitor 307 out of `/{slug}` is
 * exactly the kind of response an intermediate cache pins to whoever scanned
 * first. The rewritten page is dynamic, so Next already answers it `no-store`.
 */
async function acquisitionResponse(request: NextRequest, slug: string) {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value ?? null;
  const acceptLanguage = request.headers.get("accept-language");

  // The shop lookup is a network call in front of the enrollment page, so it
  // only happens once the visitor's own signals have come up empty.
  const needsBusinessLocale =
    !isSupportedLocale(cookieLocale) && !matchAcceptLanguage(acceptLanguage);
  const businessLocale = needsBusinessLocale
    ? await getBusinessLocale(slug)
    : null;

  const { locale } = resolveAcquisitionLocale({
    cookieLocale,
    acceptLanguage,
    businessLocale,
  });

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${request.nextUrl.pathname.replace(/\/+$/, "")}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - /api, /auth, /go (non-localized route handlers), /internal (dev-only
    //   tooling pages), /_next, /_vercel
    // - files with extensions (e.g. favicon.ico)
    "/((?!api|auth|go|internal|_next|_vercel|.*\\..*).*)",
  ],
};
