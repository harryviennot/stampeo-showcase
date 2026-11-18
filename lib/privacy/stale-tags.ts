import {
  currentConsent,
  subscribeToConsentChange,
  type ConsentState,
} from "../consent";
import { isGaLoaded } from "../google-analytics";
import { isMetaPixelLoaded } from "../meta-pixel";
import { isPostHogRemembering, livePostHogMode } from "../posthog/consent-sync";

/**
 * A running tag cannot be unloaded, so a refusal made in another tab or window
 * only reaches this one by reloading it. A window with Google Analytics or the
 * Meta pixel loaded reloads when what the visitor allows differs from what it
 * last saw. A window whose PostHog was keeping the visitor's id on the device
 * reloads only when PostHog may no longer remember them: a choice about
 * advertising changes nothing for it. Both are checked when the window is shown
 * again, when it is focused (a second window beside the first never fires
 * `visibilitychange`) and on each page of the site; a choice made in this
 * window already reloads on revocation.
 *
 * PostHog counts as loaded, and as remembering, as of the last look, not as of
 * now: a grant made elsewhere switches PostHog to the cookie in this window
 * just before the check, and must not reload it.
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
  options: { tagsLoaded?: () => boolean; postHogStored?: () => boolean; postHogMayRemember?: () => boolean } = {},
): ConsentWatcher {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return { recheck: () => {}, stop: () => {} };
  }
  const tagsLoaded = options.tagsLoaded ?? (() => isGaLoaded() || isMetaPixelLoaded());
  const postHogStored = options.postHogStored ?? isPostHogRemembering;
  const postHogMayRemember = options.postHogMayRemember ?? (() => livePostHogMode().remember);

  let seen = currentConsent();
  let postHogStoredAtLastLook = postHogStored();
  let mayRememberAtLastLook = postHogMayRemember();
  const look = () => {
    seen = currentConsent();
    postHogStoredAtLastLook = postHogStored();
    mayRememberAtLastLook = postHogMayRemember();
  };
  const unsubscribe = subscribeToConsentChange(look);
  const recheck = () => {
    if (document.visibilityState !== "visible") return;
    const now = currentConsent();
    const tagsStale = tagsLoaded() && consentChangedSince(seen, now);
    const postHogStale = postHogStoredAtLastLook && mayRememberAtLastLook && !postHogMayRemember();
    if (tagsStale || postHogStale) window.location.reload();
    look();
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
