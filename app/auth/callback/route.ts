import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  buildLastLoginCookie,
  type LastLoginMethod,
} from "@/lib/last-login";

const ONBOARDING_PATH_PATTERN = /^\/[a-z]{2}\/onboarding(?:[?/].*)?$/;

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");

  // Resolve the showcase base for relative redirects. Behind a reverse proxy
  // that doesn't forward Host/X-Forwarded-Host, `requestUrl.origin` resolves
  // to the container's internal `http://0.0.0.0:3000`, which then surfaces as
  // a broken redirect to the browser. Pin to the configured public URL.
  const baseUrl =
    process.env.NEXT_PUBLIC_SHOWCASE_URL ??
    request.headers.get("origin") ??
    requestUrl.origin;

  // Surface OAuth provider errors that arrive before code exchange
  // (e.g. ?error=access_denied&error_description=...).
  const providerError = requestUrl.searchParams.get("error");
  if (providerError) {
    const description = requestUrl.searchParams.get("error_description") || providerError;
    console.error("[auth/callback] provider error:", providerError, description);
    return NextResponse.redirect(
      new URL(
        `/login?auth_error=${encodeURIComponent(description)}`,
        requestUrl.origin
      )
    );
  }

  let lastLoginMethod: LastLoginMethod | null = null;
  let lastLoginEmail: string | undefined;
  let hasMembership = false;

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] exchangeCodeForSession failed:", error);
      return NextResponse.redirect(
        new URL(
          `/login?auth_error=${encodeURIComponent(error.message)}`,
          requestUrl.origin
        )
      );
    }
    const provider = data.user?.app_metadata?.provider;
    if (provider === "google" || provider === "apple" || provider === "email") {
      lastLoginMethod = provider;
      lastLoginEmail = data.user?.email ?? undefined;
    }
    if (data.user?.id) {
      const { count, error: membershipError } = await supabase
        .from("memberships")
        .select("id", { head: true, count: "exact" })
        .eq("user_id", data.user.id);
      if (membershipError) {
        console.error("[auth/callback] memberships count failed:", membershipError);
      }
      hasMembership = (count ?? 0) > 0;
    }
  } else {
    console.warn("[auth/callback] no code param in callback URL");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.stampeo.app";

  const buildResponse = (target: string | URL) => {
    const response = NextResponse.redirect(target);
    if (lastLoginMethod) {
      response.cookies.set(buildLastLoginCookie(lastLoginMethod, lastLoginEmail));
    }
    return response;
  };

  // 1. Absolute `next` targeting the configured app host — invite-link
  //    round-trips that started on app.stampeo.app. Wins over the membership
  //    branch so a fresh user accepting an invite still lands on the invite
  //    page (where the membership is actually created).
  if (next) {
    try {
      const target = new URL(next);
      const allowedHost = new URL(appUrl).host;
      if (target.host === allowedHost) {
        return buildResponse(target.toString());
      }
    } catch {
      // not an absolute URL — fall through to the relative/business-aware
      // branches below.
    }
  }

  // 2. Existing user (has any membership) → straight to the dashboard.
  //    Ignore relative `?next=...` values like `/fr/onboarding?just_authed=oauth`
  //    so a returning user clicking "Register with Google" doesn't get pushed
  //    through onboarding a second time.
  if (hasMembership) {
    return buildResponse(appUrl);
  }

  // 3. New user with a relative onboarding `next` — continue the showcase
  //    funnel where they left off.
  if (next && next.startsWith("/") && !next.startsWith("//") && ONBOARDING_PATH_PATTERN.test(next)) {
    return buildResponse(new URL(next, baseUrl));
  }

  // 4. New user with no usable `next` (typical login → no business yet) —
  //    drop them into the onboarding funnel using the locale from the
  //    NEXT_LOCALE cookie (falls back to FR, the default app locale).
  const localeCookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("NEXT_LOCALE="))
    ?.split("=")[1];
  const locale = localeCookie === "en" ? "en" : "fr";
  return buildResponse(
    new URL(`/${locale}/onboarding?just_authed=oauth`, baseUrl)
  );
}
