"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { forwardWhenRecorded } from "@/lib/auth/start-forward";

/**
 * A spinner while the landing is recorded, then the sign-up page. The
 * destination is fixed: nothing in the URL can change where the visitor goes.
 */
export function StartForwarder() {
  const router = useRouter();

  useEffect(
    () =>
      forwardWhenRecorded({
        readCookies: () => document.cookie,
        now: Date.now,
        forward: () => router.replace("/onboarding"),
      }),
    [router],
  );

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
