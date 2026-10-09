"use client";

import { useSyncExternalStore } from "react";
import { hasSupabaseSession, supabaseProjectRef } from "./session-hint";

const PROJECT_REF = supabaseProjectRef(process.env.NEXT_PUBLIC_SUPABASE_URL) ?? "";

const listeners = new Set<() => void>();

/** Makes every `useHasSession` re-read the cookie, after this tab signs in or out. */
export function notifySessionChanged(): void {
  for (const listener of listeners) listener();
}

// Also re-read on focus: the dashboard shares the cookie domain, so signing in
// or out there in another tab shows up when the visitor comes back.
function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("focus", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("focus", listener);
  };
}

const readCookie = () => hasSupabaseSession(document.cookie, PROJECT_REF);

/** Whether the visitor looks signed in. False in the server HTML and while hydrating; the cookie decides right after. */
export function useHasSession(): boolean {
  return useSyncExternalStore(subscribe, readCookie, () => false);
}

/** Signs out with supabase-js, downloaded only now, then re-renders every `useHasSession`. */
export async function signOut(): Promise<void> {
  sessionStorage.removeItem("stampeo_onboarding_session");
  localStorage.removeItem("stampeo_onboarding");
  const { createClient } = await import("@/lib/supabase/client");
  await createClient().auth.signOut();
  notifySessionChanged();
}
