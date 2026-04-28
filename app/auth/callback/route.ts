import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  buildLastLoginCookie,
  type LastLoginMethod,
} from "@/lib/last-login";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");

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

  if (next) {
    // Relative path: redirect within showcase
    if (next.startsWith("/") && !next.startsWith("//")) {
      return buildResponse(new URL(next, requestUrl.origin));
    }
    // Absolute URL targeting the configured app host (e.g. invite-link
    // round-trips that started on app.stampeo.app)
    try {
      const target = new URL(next);
      const allowedHost = new URL(appUrl).host;
      if (target.host === allowedHost) {
        return buildResponse(target.toString());
      }
    } catch {
      // not a valid URL — fall through to default
    }
  }

  return buildResponse(appUrl);
}
