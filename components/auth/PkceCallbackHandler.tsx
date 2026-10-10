"use client";

import { useEffect } from "react";
import { isPkceCallback, supabaseProjectRef } from "@/lib/auth/session-hint";
import { notifySessionChanged } from "@/lib/auth/use-has-session";

/**
 * Finishes a sign-in that Supabase sends to the homepage instead of
 * /auth/callback, which it does when a redirect URL is not on its allowlist.
 * supabase-js is downloaded only when the URL carries a code this browser can
 * exchange; creating the client performs the exchange.
 */
export function PkceCallbackHandler() {
  useEffect(() => {
    const ref = supabaseProjectRef(process.env.NEXT_PUBLIC_SUPABASE_URL) ?? "";
    if (!isPkceCallback(window.location.search, document.cookie, ref)) return;

    void (async () => {
      const { createClient } = await import("@/lib/supabase/client");
      await createClient().auth.getSession();
      notifySessionChanged();
    })();
  }, []);

  return null;
}
