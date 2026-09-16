/**
 * The Meta pixel's decision logic (STA-319).
 *
 * The pixel itself is four lines of imperative script injection. Everything
 * that can be got WRONG is in the predicates below, so all of it is pure and
 * all of it is tested here.
 *
 * Three rules drive the cases.
 *
 * 1. EVERY CONDITION IS LOAD-BEARING. The gate is an AND of four independent
 *    facts, and each one is tested alone against the other three being true.
 *    A gate that passes on three of four is not a gate.
 *
 * 2. THE PAGE MATTERS AS MUCH AS THE CONSENT. `/[locale]/[slug]` is the QR
 *    enrollment page a business hands to ITS customers. Consent given on
 *    `/pricing` does not make a café's customers ad prospects, so
 *    `trackable` is checked on load AND on every single event — the script
 *    cannot be unloaded once it is resident, so per-call checking is the only
 *    thing left.
 *
 * 3. AN UNMAPPED CTA IS SILENT. A new CTA location sends nothing until someone
 *    maps it deliberately. Silence is a gap in a dashboard; a wrong event is a
 *    campaign optimising against the wrong thing.
 *
 * `lib/consent.test.ts` owns the question of what a visitor agreed to. This
 * file assumes that answer and tests what is done with it.
 */

import { describe, expect, test } from "bun:test";
import { resolveConsent } from "./consent";
import {
  metaEventForCTA,
  readMetaPixelId,
  shouldLoadMetaPixel,
  shouldSendMetaEvent,
} from "./meta-pixel";

/** Every condition satisfied. Each test below breaks exactly one. */
const LOADABLE = {
  pixelId: "1088158323750710",
  marketing: true,
  ready: true,
  trackable: true,
} as const;

describe("readMetaPixelId", () => {
  test("a configured id is returned", () => {
    expect(readMetaPixelId("1088158323750710")).toBe("1088158323750710");
  });

  test("an absent id is null, not a crash", () => {
    // The state of every environment until the id is deployed, and of CI
    // forever: the build must not depend on the variable existing.
    expect(readMetaPixelId(undefined)).toBeNull();
    expect(readMetaPixelId("")).toBeNull();
  });

  test("a whitespace-only id is null", () => {
    // A var set to "" or " " in a Docker build arg is the realistic typo, and
    // `fbq('init', ' ')` would be a live tag pointed at nothing.
    expect(readMetaPixelId("   ")).toBeNull();
    expect(readMetaPixelId("\n")).toBeNull();
  });

  test("surrounding whitespace is trimmed", () => {
    expect(readMetaPixelId(" 1088158323750710 ")).toBe("1088158323750710");
  });
});

describe("shouldLoadMetaPixel — the gate", () => {
  test("every condition satisfied loads the pixel", () => {
    // AC4. The positive path has to work: a gate hard-wired to false would
    // pass every other test in this file and ship a pixel that never fires.
    expect(shouldLoadMetaPixel(LOADABLE)).toBe(true);
  });

  test("refused marketing consent blocks it, pixel id notwithstanding", () => {
    // AC2. The case the whole design exists for.
    expect(shouldLoadMetaPixel({ ...LOADABLE, marketing: false })).toBe(false);
  });

  test("no pixel id blocks it, consent notwithstanding", () => {
    // AC3.
    expect(shouldLoadMetaPixel({ ...LOADABLE, pixelId: null })).toBe(false);
  });

  test("the first paint blocks it", () => {
    // AC10. `ready` is false during SSR and until the regime is detected from
    // the timezone. Loading on the server's placeholder would fire at a
    // European visitor on the strength of a default, and would bake one
    // visitor's answer into a statically generated page.
    expect(shouldLoadMetaPixel({ ...LOADABLE, ready: false })).toBe(false);
  });

  test("a non-trackable path blocks it, consent notwithstanding", () => {
    // AC11. The irreversible mistake. A visitor may have accepted on /pricing
    // and then followed a QR code to a business's enrollment page; their
    // consent does not extend to being tracked as that café's customer.
    expect(shouldLoadMetaPixel({ ...LOADABLE, trackable: false })).toBe(false);
  });

  test("nothing satisfied is false", () => {
    expect(
      shouldLoadMetaPixel({
        pixelId: null,
        marketing: false,
        ready: false,
        trackable: false,
      }),
    ).toBe(false);
  });
});

describe("shouldLoadMetaPixel — composed with the real consent resolver", () => {
  // These compose STA-317's resolver with this gate, so a change to the regime
  // rules fails HERE rather than silently altering who gets a pixel.

  test("a US visitor with no stored choice loads the pixel without clicking", () => {
    // AC14. Deliberate, and confirmed by the user: as of 2026 no US state law
    // requires prior consent, so the US is notice-and-opt-out. This test exists
    // so that fact is asserted somewhere rather than discovered during QA and
    // filed as a bug.
    const state = resolveConsent({ record: null, regime: "opt-out", gpc: false });
    expect(state.marketing).toBe(true);
    expect(
      shouldLoadMetaPixel({ ...LOADABLE, marketing: state.marketing }),
    ).toBe(true);
  });

  test("a US visitor sending GPC loads nothing", () => {
    // GPC is a legally binding opt-out in twelve states and is honoured before
    // any regime default.
    const state = resolveConsent({ record: null, regime: "opt-out", gpc: true });
    expect(
      shouldLoadMetaPixel({ ...LOADABLE, marketing: state.marketing }),
    ).toBe(false);
  });

  test("a European visitor with no stored choice loads nothing", () => {
    const state = resolveConsent({ record: null, regime: "opt-in", gpc: false });
    expect(
      shouldLoadMetaPixel({ ...LOADABLE, marketing: state.marketing }),
    ).toBe(false);
  });

  test("a visitor who accepted analytics but refused marketing loads nothing", () => {
    // The categories are independent. GA4 (STA-318) may run while this does not.
    const state = resolveConsent({
      record: { v: 1, analytics: true, marketing: false, at: 0, regime: "opt-in" },
      regime: "opt-in",
      gpc: false,
    });
    expect(
      shouldLoadMetaPixel({ ...LOADABLE, marketing: state.marketing }),
    ).toBe(false);
  });
});

describe("shouldSendMetaEvent", () => {
  test("a loaded pixel on a trackable path sends", () => {
    expect(shouldSendMetaEvent({ loaded: true, trackable: true })).toBe(true);
  });

  test("an unloaded pixel sends nothing", () => {
    // AC5. Call sites do not branch on consent, so this predicate is what
    // stands between an un-inited `fbq` and a ReferenceError.
    expect(shouldSendMetaEvent({ loaded: false, trackable: true })).toBe(false);
  });

  test("a loaded pixel on a non-trackable path sends nothing", () => {
    // AC13, and the reason this predicate exists separately from the load gate.
    // Someone lands on /pricing, accepts, the script loads — then navigates
    // client-side to a business slug. The script is resident and CANNOT be
    // unloaded. Not calling it is the entire remaining defence.
    expect(shouldSendMetaEvent({ loaded: true, trackable: false })).toBe(false);
  });
});

describe("metaEventForCTA", () => {
  test("signup-bound CTAs are Leads", () => {
    // AC6. Lead, not CompleteRegistration: the click leaves showcase for the
    // app and we do not observe whether an account was created.
    for (const ctaLocation of [
      "hero",
      "pricing_starter",
      "pricing_growth",
      "pricing_pro",
      "faq",
      "final_cta",
      "loyalty_picker",
    ]) {
      expect(metaEventForCTA({ ctaLocation, href: "/onboarding" })).toBe("Lead");
    }
  });

  test("demo CTAs are Contacts", () => {
    // Kept distinct from Lead: self-serve signup and a sales touch are
    // different funnels and campaigns optimise for them separately. AEM ranks
    // 8 events and this taxonomy uses 3, so the distinction is free.
    expect(metaEventForCTA({ ctaLocation: "hero_demo", href: "/contact" })).toBe(
      "Contact",
    );
    expect(
      metaEventForCTA({ ctaLocation: "final_cta_demo", href: "/contact" }),
    ).toBe("Contact");
  });

  test("the destination decides when it disagrees with the location", () => {
    // `CTAButton` already picks its PostHog event from the href rather than the
    // location name, so a mapped CTA repointed at /contact must follow.
    expect(metaEventForCTA({ ctaLocation: "hero", href: "/contact" })).toBe(
      "Contact",
    );
  });

  test("a locale-prefixed contact href is still a Contact", () => {
    // `Link` from @/i18n/navigation prefixes at render time. The raw prop is
    // unprefixed today, but a call site passing a resolved href must not
    // silently downgrade to Lead.
    expect(metaEventForCTA({ ctaLocation: "hero_demo", href: "/en/contact" })).toBe(
      "Contact",
    );
    expect(metaEventForCTA({ ctaLocation: "hero_demo", href: "/es/contact" })).toBe(
      "Contact",
    );
  });

  test("an unmapped CTA location is silent", () => {
    // AC6's negative half. A CTA added later sends nothing until someone maps
    // it: a missing event is a gap in a dashboard, a wrong one is a campaign
    // optimising against noise.
    expect(metaEventForCTA({ ctaLocation: "newsletter_signup", href: "/x" })).toBeNull();
    expect(metaEventForCTA({ ctaLocation: "", href: "/onboarding" })).toBeNull();
  });

  test("an unmapped location pointing at /contact is still silent", () => {
    // The location allowlist is checked BEFORE the href, so an unknown CTA
    // cannot smuggle itself in by its destination.
    expect(metaEventForCTA({ ctaLocation: "footer_demo", href: "/contact" })).toBeNull();
  });
});
