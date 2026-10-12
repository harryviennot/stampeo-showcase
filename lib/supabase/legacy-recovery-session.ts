import type { createClient as CreateSupabaseClient } from "@supabase/supabase-js";
import { supabaseProjectRef } from "../auth/session-hint";

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

// The throwaway client's own storage key: supabase-js names its Web Lock and
// its BroadcastChannel after the key, and the app session's must stay quiet.
const CLEANUP_STORAGE_KEY = "sb-legacy-recovery-cleanup";

/** Storage where the cleanup key is the legacy localStorage entry and every other key lives in memory. */
function storageForLegacyEntry(storage: StorageLike, legacyKey: string): StorageLike {
  const scratch = new Map<string, string>();
  const isEntry = (key: string) => key === CLEANUP_STORAGE_KEY;
  return {
    getItem: (key) => (isEntry(key) ? storage.getItem(legacyKey) : (scratch.get(key) ?? null)),
    setItem: (key, value) => (isEntry(key) ? storage.setItem(legacyKey, value) : void scratch.set(key, value)),
    removeItem: (key) => (isEntry(key) ? storage.removeItem(legacyKey) : void scratch.delete(key)),
  };
}

/**
 * Revokes and deletes a recovery session left in localStorage under
 * supabase-js's default key; the entry is deleted whatever the sign-out
 * answers. Does nothing without one, and never throws.
 */
export async function clearLegacyRecoverySession(options: {
  storage: StorageLike;
  url: string;
  anonKey: string;
  /** Loads supabase-js, only once an entry was found. */
  loadCreateClient: () => Promise<typeof CreateSupabaseClient>;
}): Promise<void> {
  const { storage, url, anonKey, loadCreateClient } = options;
  const ref = supabaseProjectRef(url);
  if (!ref) return;
  const legacyKey = `sb-${ref}-auth-token`;

  try {
    if (storage.getItem(legacyKey) === null) return;
  } catch {
    return;
  }

  try {
    const createClient = await loadCreateClient();
    const client = createClient(url, anonKey, {
      auth: {
        storageKey: CLEANUP_STORAGE_KEY,
        storage: storageForLegacyEntry(storage, legacyKey),
        autoRefreshToken: false,
        detectSessionInUrl: false,
        lock: async (_name, _acquireTimeout, run) => run(),
      },
    });
    try {
      await client.auth.signOut({ scope: "local" });
    } finally {
      await client.auth.stopAutoRefresh();
    }
  } catch {
    // An expired, revoked or unreachable session is deleted all the same.
  } finally {
    try {
      storage.removeItem(legacyKey);
    } catch {
      // Storage went away: nothing left to delete.
    }
  }
}
