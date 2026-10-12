"use client";

import { useEffect } from "react";
import { clearLegacyRecoverySession } from "@/lib/supabase/legacy-recovery-session";

let started = false;

/**
 * Revokes and deletes a password-recovery session left in localStorage, once
 * per page load. supabase-js is downloaded only when there is one.
 */
export function LegacyRecoverySessionCleanup() {
  useEffect(() => {
    if (started) return;
    started = true;
    let storage: Storage;
    try {
      storage = window.localStorage;
    } catch {
      return;
    }
    void clearLegacyRecoverySession({
      storage,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      loadCreateClient: async () => (await import("@supabase/supabase-js")).createClient,
    });
  }, []);

  return null;
}
