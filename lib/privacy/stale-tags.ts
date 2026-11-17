import {
  currentConsent,
  subscribeToConsentChange,
  type ConsentState,
} from "../consent";
import { isGaLoaded } from "../google-analytics";
import { isMetaPixelLoaded } from "../meta-pixel";
import { isPostHogRemembering } from "../posthog/consent-sync";

/**
 * A running tag cannot be unloaded, so a refusal made in another tab or window
 * only reaches this one by reloading it. A window that has a tag loaded, or
 * whose PostHog was keeping the visitor's id on the device, reloads when what
 * the visitor allows differs from what it last saw, checked when it is shown
 * again, when it is focused (a second window beside the first never fires
 * `visibilitychange`) and on each page of the site; a choice made in this
 * window already reloads on revocation.
 *
 * PostHog counts as loaded as of the last look, not as of now: a grant made
 * elsewhere switches PostHog to the cookie in this window just before the
 * check, and must not reload it.
 */

/** Does what the visitor allows now differ from what it was? */
export function consentChangedSince(seen: ConsentState, now: ConsentState): boolean {
  return seen.analytics !== now.analytics || seen.marketing !== now.marketing;
}

export interface ConsentWatcher {
  /** Look again now, as on a navigation. */
  recheck(): void;
  stop(): void;
}

/** Watch for what the visitor allows changing elsewhere. */
export function watchConsentAcrossTabs(
  options: { tagsLoaded?: () => boolean; postHogStored?: () => boolean } = {},
): ConsentWatcher {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return { recheck: () => {}, stop: () => {} };
  }
  const tagsLoaded = options.tagsLoaded ?? (() => isGaLoaded() || isMetaPixelLoaded());
  const postHogStored = options.postHogStored ?? isPostHogRemembering;

  let seen = currentConsent();
  let postHogStoredAtLastLook = postHogStored();
  const look = () => {
    seen = currentConsent();
    postHogStoredAtLastLook = postHogStored();
  };
  const unsubscribe = subscribeToConsentChange(look);
  const recheck = () => {
    if (document.visibilityState !== "visible") return;
    const now = currentConsent();
    if ((tagsLoaded() || postHogStoredAtLastLook) && consentChangedSince(seen, now)) window.location.reload();
    seen = now;
    postHogStoredAtLastLook = postHogStored();
  };

  document.addEventListener("visibilitychange", recheck);
  window.addEventListener("focus", recheck);
  return {
    recheck,
    stop() {
      unsubscribe();
      document.removeEventListener("visibilitychange", recheck);
      window.removeEventListener("focus", recheck);
    },
  };
}
