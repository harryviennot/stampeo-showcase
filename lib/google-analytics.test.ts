/**
 * GA4's decision logic (STA-318).
 *
 * The tag itself is a script element and a `dataLayer` push. Everything that
 * can be got WRONG is in the predicates below, so all of it is pure and all of
 * it is tested here. The shape deliberately mirrors `lib/meta-pixel.test.ts`:
 * two tags, one gate, and no second opinion about consent.
 *
 * Four rules drive the cases.
 *
 * 1. EVERY CONDITION IS LOAD-BEARING. The gate is an AND of four independent
 *    facts, and each one is tested alone against the other three being true.
 *    A gate that passes on three of four is not a gate.
 *
 * 2. THE PAGE MATTERS AS MUCH AS THE CONSENT. `/[locale]/[slug]` is the QR
 *    enrollment page a business hands to ITS customers, and `/onboarding` is
 *    someone mid-signup. Consent given on `/pricing` does not extend to
 *    either, so `trackable` is checked on load AND on every event.
 *
 * 3. A PAGE VIEW IS NOT AUTOMATIC. gtag fires `page_view` once, at load. Every
 *    App Router navigation after that is silent unless we send one — and
 *    sending one per effect run instead of per navigation inflates every
 *    funnel. Both failure directions are tested.
 *
 * 4. AN UNMAPPED CTA IS SILENT. A new CTA location sends nothing until someone
 *    maps it deliberately. Silence is a gap in a dashboard; a wrong event is a
 *    campaign optimising against the wrong thing.
 *
 * `lib/consent.test.ts` owns the question of what a visitor agreed to. This
 * file assumes that answer and tests what is done with it.
 */

import { describe, expect, test } from "bun:test";
import { resolveConsent } from "./consent";
import {
  gaEventForCTA,
  gaScriptSrc,
  readMeasurementId,
  shouldLoadGa,
  shouldSendGaEvent,
  shouldSendPageView,
} from "./google-analytics";

const MEASUREMENT_ID = "G-ZFZ6JLPFXN";

/** Every condition satisfied. Each test below breaks exactly one. */
const LOADABLE = {
  measurementId: MEASUREMENT_ID,
  analytics: true,
  ready: true,
  trackable: true,
};

describe("readMeasurementId", () => {
  test("a configured id is returned", () => {
    expect(readMeasurementId(MEASUREMENT_ID)).toBe(MEASUREMENT_ID);
  });

  test("an absent id is null, not a crash", () => {
    expect(readMeasurementId(undefined)).toBeNull();
    expect(readMeasurementId(null)).toBeNull();
    expect(readMeasurementId("")).toBeNull();
  });

  test("a whitespace-only id is null", () => {
    // The realistic typo is a Docker build arg set to "", which arrives here
    // as a space rather than as undefined.
    expect(readMeasurementId("   ")).toBeNull();
  });

  test("surrounding whitespace is trimmed", () => {
    expect(readMeasurementId(`  ${MEASUREMENT_ID}\n`)).toBe(MEASUREMENT_ID);
  });

  test("a Google Tag Manager container id is rejected", () => {
    // GTM-XXXXXXX is the single most common thing pasted into a GA4 variable
    // by mistake. Loading it would fetch a real script that reports nothing to
    // this property, which looks like working tracking and is not.
    expect(readMeasurementId("GTM-ABCDEFG")).toBeNull();
  });

  test("a Meta pixel id is rejected", () => {
    // Two tags, two env vars, adjacent lines in .env.example.
    expect(readMeasurementId("1088158323750710")).toBeNull();
  });
});

describe("gaScriptSrc", () => {
  test("points at googletagmanager with the id as the query", () => {
    expect(gaScriptSrc(MEASUREMENT_ID)).toBe(
      `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
    );
  });
});

describe("shouldLoadGa — the gate", () => {
  test("every condition satisfied loads the tag", () => {
    expect(shouldLoadGa(LOADABLE)).toBe(true);
  });

  test("refused analytics consent blocks it, measurement id notwithstanding", () => {
    expect(shouldLoadGa({ ...LOADABLE, analytics: false })).toBe(false);
  });

  test("no measurement id blocks it, consent notwithstanding", () => {
    expect(shouldLoadGa({ ...LOADABLE, measurementId: null })).toBe(false);
  });

  test("the first paint blocks it", () => {
    // `ready` is false during SSR and the first client render. Acting earlier
    // decides on a server-render placeholder for the regime, which means
    // firing at a European visitor on a default.
    expect(shouldLoadGa({ ...LOADABLE, ready: false })).toBe(false);
  });

  test("a non-trackable path blocks it, consent notwithstanding", () => {
    expect(shouldLoadGa({ ...LOADABLE, trackable: false })).toBe(false);
  });

  test("nothing satisfied is false", () => {
    expect(
      shouldLoadGa({
        measurementId: null,
        analytics: false,
        ready: false,
        trackable: false,
      })
    ).toBe(false);
  });
});

describe("shouldLoadGa — composed with the real consent resolver", () => {
  /**
   * The gate is only as good as the answer it is given, so these run the
   * actual resolver from `lib/consent.ts` rather than a hand-written boolean.
   */
  const gate = (state: { analytics: boolean }) =>
    shouldLoadGa({ ...LOADABLE, analytics: state.analytics });

  test("a US visitor with no stored choice loads the tag without clicking", () => {
    // The opt-out regime. Deliberate — see `resolveConsent`.
    expect(
      gate(resolveConsent({ record: null, regime: "opt-out", gpc: false }))
    ).toBe(true);
  });

  test("a US visitor sending GPC loads nothing", () => {
    expect(
      gate(resolveConsent({ record: null, regime: "opt-out", gpc: true }))
    ).toBe(false);
  });

  test("a European visitor with no stored choice loads nothing", () => {
    expect(
      gate(resolveConsent({ record: null, regime: "opt-in", gpc: false }))
    ).toBe(false);
  });

  test("a visitor who accepted marketing but refused analytics loads nothing", () => {
    // The mirror of the Meta case: GA4 is gated on `analytics`, and accepting
    // the ad pixels is not an answer about this one.
    expect(
      gate(
        resolveConsent({
          record: {
            v: 1,
            analytics: false,
            marketing: true,
            at: 0,
            regime: "opt-in",
          },
          regime: "opt-in",
          gpc: false,
        })
      )
    ).toBe(false);
  });

  test("a visitor who accepted analytics loads the tag", () => {
    expect(
      gate(
        resolveConsent({
          record: {
            v: 1,
            analytics: true,
            marketing: false,
            at: 0,
            regime: "opt-in",
          },
          regime: "opt-in",
          gpc: false,
        })
      )
    ).toBe(true);
  });
});

describe("shouldSendGaEvent", () => {
  test("a loaded tag on a trackable path sends", () => {
    expect(shouldSendGaEvent({ loaded: true, trackable: true })).toBe(true);
  });

  test("an unloaded tag sends nothing", () => {
    // No queue-and-replay: an event recorded before consent must not be
    // flushed into a tag loaded after it.
    expect(shouldSendGaEvent({ loaded: false, trackable: true })).toBe(false);
  });

  test("a loaded tag on a non-trackable path sends nothing", () => {
    // The visitor accepted on /pricing and then followed a QR code to a
    // business's enrollment page. The script cannot be unloaded, so not
    // calling gtag is all that is left.
    expect(shouldSendGaEvent({ loaded: true, trackable: false })).toBe(false);
  });
});

describe("shouldSendPageView", () => {
  const RESIDENT = { loaded: true, trackable: true, lastPath: "/pricing" };

  test("a client-side navigation to a new path sends one", () => {
    // gtag only fires page_view at load. Without this every campaign landing
    // reads as a one-page session.
    expect(shouldSendPageView({ ...RESIDENT, nextPath: "/about" })).toBe(true);
  });

  test("the same path twice sends nothing", () => {
    // React strict mode runs the effect twice on mount, and a consent change
    // re-runs it on the same path. Either one would double-count.
    expect(shouldSendPageView({ ...RESIDENT, nextPath: "/pricing" })).toBe(
      false
    );
  });

  test("the first page view after load is left to gtag", () => {
    // `initGa` configures the tag, which sends the initial page_view itself.
    // Sending one here as well is the duplicate that plan AC8 forbids.
    expect(
      shouldSendPageView({ ...RESIDENT, lastPath: null, nextPath: "/pricing" })
    ).toBe(false);
  });

  test("navigating onto a private route sends nothing", () => {
    // AC7/AC9: /onboarding must never appear in GA4, even for a visitor who
    // consented on a marketing page moments earlier.
    expect(
      shouldSendPageView({ ...RESIDENT, trackable: false, nextPath: "/onboarding" })
    ).toBe(false);
  });

  test("returning to a trackable route after a private one sends one", () => {
    // The private path was never recorded, so coming back is a real
    // navigation and not a duplicate.
    expect(
      shouldSendPageView({
        loaded: true,
        trackable: true,
        lastPath: "/pricing",
        nextPath: "/features",
      })
    ).toBe(true);
  });

  test("an unloaded tag sends nothing whatever the path", () => {
    expect(
      shouldSendPageView({
        loaded: false,
        trackable: true,
        lastPath: "/pricing",
        nextPath: "/about",
      })
    ).toBe(false);
  });
});

describe("gaEventForCTA", () => {
  test("signup-bound CTAs are sign_up_cta_click", () => {
    for (const ctaLocation of [
      "hero",
      "pricing_starter",
      "pricing_growth",
      "pricing_pro",
      "faq",
      "final_cta",
      "loyalty_picker",
    ]) {
      expect(gaEventForCTA({ ctaLocation, href: "/onboarding" })).toBe(
        "sign_up_cta_click"
      );
    }
  });

  test("demo CTAs are contact_cta_click", () => {
    for (const ctaLocation of ["hero_demo", "final_cta_demo"]) {
      expect(gaEventForCTA({ ctaLocation, href: "/contact" })).toBe(
        "contact_cta_click"
      );
    }
  });

  test("the destination decides when it disagrees with the location", () => {
    // Mirrors how CTAButton already picks its PostHog event.
    expect(gaEventForCTA({ ctaLocation: "hero", href: "/contact" })).toBe(
      "contact_cta_click"
    );
  });

  test("a locale-prefixed contact href is still a contact", () => {
    // `Link` from @/i18n/navigation prefixes at render time, so a call site
    // passing a resolved href must not silently downgrade.
    expect(gaEventForCTA({ ctaLocation: "hero", href: "/es/contact" })).toBe(
      "contact_cta_click"
    );
  });

  test("an unmapped CTA location is silent", () => {
    expect(gaEventForCTA({ ctaLocation: "newsletter_footer", href: "/" })).toBeNull();
  });

  test("an unmapped location pointing at /contact is still silent", () => {
    // The allowlist is checked before the destination, so an unmapped CTA
    // cannot smuggle itself in by pointing somewhere known.
    expect(
      gaEventForCTA({ ctaLocation: "newsletter_footer", href: "/contact" })
    ).toBeNull();
  });
});
