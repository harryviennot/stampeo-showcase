import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to business app after email confirmation
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.stampeo.app";
  return NextResponse.redirect(appUrl);
}
