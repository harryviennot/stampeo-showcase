import {
  currentConsent,
  subscribeToConsentChange,
  type ConsentState,
} from "../consent";
import { isGaLoaded } from "../google-analytics";
import { isMetaPixelLoaded } from "../meta-pixel";

/**
 * A running tag cannot be unloaded, so a refusal made in another tab only
 * reaches this one by reloading it. When the tab is shown again and what the
 * visitor allows differs from what it last saw, a tab that has a tag loaded
 * reloads; a choice made in this tab already reloads on revocation.
 */

/** Does what the visitor allows now differ from what it was? */
export function consentChangedSince(seen: ConsentState, now: ConsentState): boolean {
  return seen.analytics !== now.analytics || seen.marketing !== now.marketing;
}

/** Watch for the tab coming back to the front. Returns the unsubscribe. */
export function watchConsentAcrossTabs(
  options: { tagsLoaded?: () => boolean } = {},
): () => void {
  if (typeof document === "undefined" || typeof window === "undefined") return () => {};
  const tagsLoaded = options.tagsLoaded ?? (() => isGaLoaded() || isMetaPixelLoaded());

  let seen = currentConsent();
  const unsubscribe = subscribeToConsentChange(() => {
    seen = currentConsent();
  });
  const onVisible = () => {
    if (document.visibilityState !== "visible") return;
    const now = currentConsent();
    if (tagsLoaded() && consentChangedSince(seen, now)) window.location.reload();
    seen = now;
  };

  document.addEventListener("visibilitychange", onVisible);
  return () => {
    unsubscribe();
    document.removeEventListener("visibilitychange", onVisible);
  };
}
