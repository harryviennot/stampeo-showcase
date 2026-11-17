import { expireCookie, presentCookieNames } from "../consent";

/** The prefix of every cookie and storage key PostHog writes (`ph_<project key>_posthog` and its siblings). */
const POSTHOG_PREFIX = "ph_";

/** Remove the `ph_*` keys of one storage, listing them first because removing while listing skips keys. */
function purgeStorage(store: Pick<Storage, "length" | "key" | "removeItem">): void {
  const keys: string[] = [];
  for (let index = 0; index < store.length; index++) {
    const key = store.key(index);
    if (key?.startsWith(POSTHOG_PREFIX)) keys.push(key);
  }
  for (const key of keys) store.removeItem(key);
}

/** Delete every `ph_*` cookie, and every `ph_*` key in localStorage and sessionStorage. Never throws: blocked storage has nothing to delete. */
export function purgePostHogStorage(): void {
  for (const name of presentCookieNames()) {
    if (name.startsWith(POSTHOG_PREFIX)) expireCookie(name);
  }
  for (const area of ["localStorage", "sessionStorage"] as const) {
    try {
      const store: Storage | undefined = globalThis[area];
      if (store) purgeStorage(store);
    } catch {
      // Storage the browser blocks throws on access; nothing was stored there.
    }
  }
}
