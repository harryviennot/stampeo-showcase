import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] exchangeCodeForSession failed:", error);
      return NextResponse.redirect(
        new URL(
          `/login?auth_error=${encodeURIComponent(error.message)}`,
          requestUrl.origin
        )
      );
    }
  } else {
    console.warn("[auth/callback] no code param in callback URL");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.stampeo.app";

  if (next) {
    // Relative path: redirect within showcase
    if (next.startsWith("/") && !next.startsWith("//")) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
    // Absolute URL targeting the configured app host (e.g. invite-link
    // round-trips that started on app.stampeo.app)
    try {
      const target = new URL(next);
      const allowedHost = new URL(appUrl).host;
      if (target.host === allowedHost) {
        return NextResponse.redirect(target.toString());
      }
    } catch {
      // not a valid URL — fall through to default
    }
  }

  return NextResponse.redirect(appUrl);
}
