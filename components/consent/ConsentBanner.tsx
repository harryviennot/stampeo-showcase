"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useConsent } from "@/hooks/use-consent";
import { isTrackablePath } from "@/lib/consent-routes";
import {
  CONSENT_OPEN_EVENT,
  clearCookiesFor,
  consentSurface,
  currentConsent,
  emitConsentChange,
  writeConsentRecord,
  type ConsentCategory,
  type ConsentState,
} from "@/lib/consent";
import { ConsentPreferences } from "./ConsentPreferences";

const ALL_ON: ConsentState = { analytics: true, marketing: true };
const ALL_OFF: ConsentState = { analytics: false, marketing: false };
const CATEGORIES: readonly ConsentCategory[] = ["analytics", "marketing"];

/**
 * Where a visitor accepts or refuses GA4, the Meta pixel and the TikTok pixel.
 *
 * Two surfaces, one gate — see `lib/consent.ts` for which visitor gets which
 * and why the split exists at all.
 *
 * The `banner` surface carries NO dismiss affordance. Refusing is one click on
 * a button that is the same size and shape as Accept, which is what CNIL means
 * by refusing being as easy as accepting; an `×` that closes without recording
 * anything would let the site behave as though silence were consent.
 *
 * Renders nothing until `ready`. The server cannot know the visitor's region,
 * so every page's HTML stays identical for crawler and human and showcase
 * stays statically generated.
 */
export function ConsentBanner() {
  const t = useTranslations("common.cookies");
  const pathname = usePathname();
  const consent = useConsent();
  const [prefsOpen, setPrefsOpen] = useState(false);

  // Acquisition pages (`/[locale]/[slug]`) are a business's own QR enrollment
  // page: no tag fires there, so nothing may ask for consent there either.
  // This gates the DIALOG and its listener, not just the banner. Gating only
  // the banner would still let a stray `stampeo:consent-open` write a consent
  // record from a page that has nothing to consent to. Those pages render no
  // footer, so no reachable control is lost.
  const trackable = isTrackablePath(pathname);

  // The footer entry, and anything else that wants to reopen the choice.
  useEffect(() => {
    if (!trackable) return;
    const open = () => setPrefsOpen(true);
    window.addEventListener(CONSENT_OPEN_EVENT, open);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, open);
  }, [trackable]);

  const commit = useCallback(
    (next: ConsentState) => {
      // Read what was live BEFORE writing, so we can tell a revocation from a
      // first-time refusal. Only a revocation has cookies to clean up.
      const before = currentConsent();
      const revoked = CATEGORIES.filter(
        (category) => before[category] && !next[category],
      );

      writeConsentRecord(next, consent.regime);
      emitConsentChange(next);
      setPrefsOpen(false);

      if (revoked.length > 0) {
        clearCookiesFor(revoked);
        // A running gtag or fbq cannot be unloaded. Deleting its cookies stops
        // it identifying anyone, but only a reload actually stops the script,
        // so the honest move is to reload rather than to claim it is gone.
        window.location.reload();
      }
    },
    [consent.regime],
  );

  const surface = consent.ready
    ? consentSurface({
        record: consent.record,
        regime: consent.regime,
        gpc: consent.gpc,
        trackable,
      })
    : "none";

  // Both consent surfaces share a shell: a full-width sheet on a phone, and a
  // bottom-LEFT card from `sm` up.
  //
  // Left, and not full-width, because `FloatingLanguageSwitcher` is fixed at
  // `bottom-6 right-6 z-50` from `md` up. A full-width bar would put our
  // buttons underneath it, and a bottom-right card would stack on it. Sitting
  // in the opposite corner keeps both reachable at every width without either
  // component having to know the other exists.
  const surfaceShell =
    "fixed inset-x-0 bottom-0 z-50 border-t border-[var(--border)] bg-[var(--paper)] p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] " +
    "pb-[calc(1rem+env(safe-area-inset-bottom))] " +
    "sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-sm sm:rounded-2xl sm:border sm:p-5 sm:pb-5 sm:shadow-xl";

  // 44px tall and equal width: the thumb target Apple and Android both ask
  // for, and neither button can be the easier one to hit.
  const equalButton =
    "h-11 flex-1 rounded-full bg-[var(--foreground)] px-4 text-sm font-semibold text-white transition-all hover:brightness-110";

  return (
    <>
      {surface === "banner" && (
        <section
          // `region`, not `dialog`: the page stays usable and readable behind
          // it. A cookie wall — blocking the content until they choose — is
          // itself a compliance problem, not a stricter version of compliance.
          role="region"
          aria-label={t("banner.title")}
          className={surfaceShell}
        >
          <p className="text-sm font-semibold text-[var(--foreground)]">
            {t("banner.title")}
          </p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {t("banner.body")}{" "}
            <Link
              href={"/privacy#cookies" as "/privacy"}
              className="font-semibold text-[var(--accent)] underline underline-offset-2"
            >
              {t("banner.learnMore")}
            </Link>
          </p>

          {/* Above the pair, not below it. The third option is the one a
              visitor is choosing INSTEAD of answering the binary, so it reads
              better before the binary than after it, and it keeps the two
              equal buttons as the last thing on the card. A text link rather
              than a third button: it must not compete with Refuse/Accept for
              prominence, and it is not itself a consent decision. */}
          <button
            type="button"
            onClick={() => setPrefsOpen(true)}
            className="mt-3 inline-flex h-11 items-center text-sm font-semibold text-[var(--muted-foreground)] underline underline-offset-4 transition-colors hover:text-[var(--foreground)] sm:mt-4 sm:h-auto"
          >
            {t("banner.customise")}
          </button>

          {/* One row, even on the narrowest phone: both labels are short, and
              stacking them would put Accept under the thumb and Refuse a
              scroll away, which is the prominence difference in another form. */}
          <div className="mt-1 flex gap-2 sm:mt-3">
            {/* Identical class strings. Not a near-match: a Refuse button that
                is smaller, greyer or lighter than Accept is exactly the dark
                pattern the equal-prominence rule names. */}
            <button type="button" onClick={() => commit(ALL_OFF)} className={equalButton}>
              {t("banner.refuse")}
            </button>
            <button type="button" onClick={() => commit(ALL_ON)} className={equalButton}>
              {t("banner.accept")}
            </button>
          </div>
        </section>
      )}

      {surface === "notice" && (
        <section role="region" aria-label={t("notice.title")} className={surfaceShell}>
          <p className="text-sm text-[var(--muted-foreground)]">{t("notice.body")}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <button
              type="button"
              onClick={() => setPrefsOpen(true)}
              className="font-semibold text-[var(--accent)] underline underline-offset-2"
            >
              {t("notice.choices")}
            </button>
            {/* Dismissing RECORDS the opt-out regime's default rather than
                hiding the notice in component state. Local state would bring
                the notice back on the next navigation and on every reload,
                which is nagging someone who already acknowledged it, and would
                leave us with no evidence of what they were told. */}
            <button
              type="button"
              onClick={() => commit({ analytics: true, marketing: true })}
              className="font-semibold text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)]"
            >
              {t("notice.dismiss")}
            </button>
          </div>
        </section>
      )}

      {/* Mounted only where consent is meaningful, for the reason above. */}
      <ConsentPreferences
        open={trackable && prefsOpen}
        initial={{ analytics: consent.analytics, marketing: consent.marketing }}
        onClose={() => setPrefsOpen(false)}
        onSave={commit}
      />
    </>
  );
}
