"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useConsent } from "@/hooks/use-consent";
import { isTrackablePath } from "@/lib/consent-routes";
import {
  CONSENT_OPEN_EVENT,
  categoriesToClearOnChoice,
  categoriesToClearOnLoad,
  clearCookiesFor,
  clearPresentCookiesFor,
  consentSurface,
  currentConsent,
  emitConsentChange,
  revokedBy,
  writeConsentRecord,
  type ConsentState,
} from "@/lib/consent";
import {
  recordConsentDecision,
  type ConsentLedgerSurface,
} from "@/lib/consent-ledger";
import {
  NOTICE_KEYS,
  TAP_TARGET,
  noticeAcknowledgement,
  preferencesView,
} from "@/lib/privacy/choices-ui";
import { rowByKey } from "@/lib/privacy/policy";
import { watchConsentAcrossTabs, type ConsentWatcher } from "@/lib/privacy/stale-tags";
import { POLICY_MATRIX, UNKNOWN_ROW_KEY } from "@/lib/privacy/policy-matrix";
import { ConsentPreferences } from "./ConsentPreferences";

const ALL_ON: ConsentState = { analytics: true, marketing: true };
const ALL_OFF: ConsentState = { analytics: false, marketing: false };

/**
 * Where a visitor accepts or refuses GA4 and the Meta pixel.
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
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const consent = useConsent();
  const [prefsOpen, setPrefsOpen] = useState(false);
  const row = useMemo(
    () => rowByKey(consent.row) ?? POLICY_MATRIX.rows[UNKNOWN_ROW_KEY],
    [consent.row],
  );

  // `trackable` gates SOLICITATION, never MANAGEMENT.
  //
  // Asking is what must not happen on a business's own QR enrollment page
  // (`/[locale]/[slug]`): no tag fires there, so nothing may interrupt one of
  // OUR customer's customers to ask them about it.
  //
  // Reopening an existing choice is the opposite case and must work wherever
  // it can be reached, because consent has to be as easy to withdraw as it was
  // to give. `/email-preferences` is private, renders the `Footer`, and
  // therefore shows the Cookie preferences button: gating the dialog on
  // `trackable` too made that button dead on click. The footer is the real
  // gate here, and acquisition pages render no footer at all.
  const trackable = isTrackablePath(pathname);

  // A refusal made in another tab or window reloads this one when it is shown or focused, and on each page.
  const watcher = useRef<ConsentWatcher | null>(null);
  useEffect(() => {
    const current = watchConsentAcrossTabs();
    watcher.current = current;
    return current.stop;
  }, []);
  useEffect(() => {
    watcher.current?.recheck();
  }, [pathname]);

  // The footer entry, and anything else that wants to reopen the choice.
  // Deliberately NOT gated: see above.
  useEffect(() => {
    const open = () => setPrefsOpen(true);
    window.addEventListener(CONSENT_OPEN_EVENT, open);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, open);
  }, []);

  // When GPC overrides in the US, trackers set before the signal was on are
  // removed on load. No reload: no tag loads under the override, so there is no
  // running script to stop, and the consent cookie itself is never cleared.
  const { ready, gpc } = consent;
  useEffect(() => {
    if (!ready) return;
    clearPresentCookiesFor(categoriesToClearOnLoad({ row, gpc }));
  }, [ready, row, gpc]);

  const commit = useCallback(
    (next: ConsentState, surface: ConsentLedgerSurface) => {
      // Read what was live BEFORE writing: only a tag that was running needs a reload to stop.
      const revoked = revokedBy(currentConsent(), next);

      const record = writeConsentRecord(next, row);
      emitConsentChange(next);
      setPrefsOpen(false);

      // Prove the decision server-side. Deliberately AFTER the cookie and the
      // event: the choice is already in force, so this can only add evidence
      // and never cost the visitor their click. It uses `sendBeacon`, which
      // survives the reload below.
      recordConsentDecision({ record, surface });

      // Every refused category is cleared, whatever was live before.
      const refused = categoriesToClearOnChoice(next);
      if (refused.length > 0) clearCookiesFor(refused);
      if (revoked.length > 0) {
        // A running gtag or fbq cannot be unloaded. Deleting its cookies stops
        // it identifying anyone, but only a reload actually stops the script,
        // so the honest move is to reload rather than to claim it is gone.
        window.location.reload();
      }
    },
    [row],
  );

  // The dialog's region version, from the row in force and whether GPC is on.
  const view = useMemo(() => preferencesView(row, gpc), [row, gpc]);

  const surface = consent.ready
    ? consentSurface({
        record: consent.record,
        prior: consent.prior,
        gpc,
        trackable,
        row,
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
    `${TAP_TARGET} flex-1 rounded-full bg-[var(--foreground)] px-4 text-sm font-semibold text-white transition-all hover:brightness-110`;

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
            className={`mt-3 inline-flex ${TAP_TARGET} items-center text-sm font-semibold text-[var(--muted-foreground)] underline underline-offset-4 transition-colors hover:text-[var(--foreground)] sm:mt-4 sm:h-auto`}
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
            <button type="button" onClick={() => commit(ALL_OFF, "banner")} className={equalButton}>
              {t("banner.refuse")}
            </button>
            <button type="button" onClick={() => commit(ALL_ON, "banner")} className={equalButton}>
              {t("banner.accept")}
            </button>
          </div>
        </section>
      )}

      {surface === "notice" && (
        <section role="region" aria-label={t("notice.title")} className={surfaceShell}>
          <p className="text-sm text-[var(--muted-foreground)]">{t("notice.body")}</p>
          {/* The same words as the footer's US link, so what a visitor sees once
              is what they find later. 44px tall on a phone, like "customise". */}
          <div className="mt-1 flex flex-wrap items-center gap-x-5 text-sm sm:mt-3 sm:gap-y-2">
            <button
              type="button"
              onClick={() => setPrefsOpen(true)}
              className={`inline-flex ${TAP_TARGET} items-center font-semibold text-[var(--accent)] underline underline-offset-2 sm:h-auto`}
            >
              {tCommon(NOTICE_KEYS.choices)}
            </button>
            {/* Dismissing RECORDS the state in force (the opt-out default, with
                any refusal carried from an older version) rather than hiding
                the notice in component state. Local state would bring the
                notice back on the next navigation and on every reload, which
                is nagging someone who already acknowledged it, and would leave
                us with no evidence of what they were told. */}
            <button
              type="button"
              onClick={() => commit(noticeAcknowledgement(consent), "notice")}
              className={`inline-flex ${TAP_TARGET} items-center font-semibold text-[var(--muted-foreground)] transition-colors hover:text-[var(--foreground)] sm:h-auto`}
            >
              {tCommon(NOTICE_KEYS.dismiss)}
            </button>
          </div>
        </section>
      )}

      <ConsentPreferences
        open={prefsOpen}
        initial={{ analytics: consent.analytics, marketing: consent.marketing }}
        view={view}
        onClose={() => setPrefsOpen(false)}
        onSave={(next) => commit(next, "preferences")}
      />
    </>
  );
}
