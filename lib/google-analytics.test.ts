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

import { afterAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { CONSENT_VERSION, resolveConsent } from "./consent";
import { isTrackablePath } from "./consent-routes";
import {
  gaEventForCTA,
  gaScriptSrc,
  initGa,
  isGaLoaded,
  readDebugMode,
  readMeasurementId,
  shouldLoadGa,
  shouldSendGaEvent,
  shouldSendPageView,
  trackGaEvent,
  trackGaPageView,
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
            v: CONSENT_VERSION,
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
            v: CONSENT_VERSION,
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

/* =========================================================================
 * Everything below was added by the STA-318 coverage audit (gap-report.md).
 *
 * The audit's finding: the suite tested the PREDICATES and never the WIRING.
 * Every `trackable` above is a hand-written boolean, so deleting the route
 * check at a call site left the suite green. These close that.
 * ====================================================================== */

describe("the gate, against the REAL route predicate", () => {
  /**
   * AC13. Above, `trackable` is an input somebody typed. Here it is DERIVED
   * from `isTrackablePath`, so the route table and the gate cannot drift
   * apart: emptying `PRIVATE_SEGMENTS` breaks these and nothing else.
   *
   * These are the paths where being wrong is worst -- `/onboarding` is someone
   * mid-signup and `/{slug}` is a business's own customer, neither of whom
   * agreed to anything on our marketing site.
   */
  const gateOn = (path: string) =>
    shouldLoadGa({ ...LOADABLE, trackable: isTrackablePath(path) });

  const sendOn = (path: string) =>
    shouldSendGaEvent({ loaded: true, trackable: isTrackablePath(path) });

  test("the marketing pages load the tag", () => {
    // Real routes only -- see `app/[locale]/`. Pricing is `/pricing` in every
    // locale; the loyalty page is the one with per-locale slugs.
    for (const path of [
      "/",
      "/pricing",
      "/us/pricing",
      "/blog",
      "/programme-fidelite",
      "/es/programa-de-fidelizacion",
    ]) {
      expect({ path, loads: gateOn(path) }).toEqual({ path, loads: true });
    }
  });

  test("a signup in progress never loads the tag", () => {
    expect(gateOn("/onboarding")).toBe(false);
    expect(gateOn("/en/onboarding")).toBe(false);
  });

  test("a business's own enrollment page never loads the tag", () => {
    // `/{slug}` -- the QR page a business hands to ITS customers.
    expect(gateOn("/mon-cafe")).toBe(false);
    expect(gateOn("/fr/mon-cafe")).toBe(false);
  });

  test("the same predicate governs events, not just the load", () => {
    // The gate and the send must agree, or a tag loaded on /pricing keeps
    // reporting after a client-side navigation into /onboarding.
    expect(sendOn("/pricing")).toBe(true);
    expect(sendOn("/onboarding")).toBe(false);
    expect(sendOn("/mon-cafe")).toBe(false);
  });
});

describe("the CTA tables cover the whole CTALocation union", () => {
  /**
   * An unmapped CTA is silent forever, and silence is invisible: the funnel
   * just reads slightly low. So the union is read OUT OF THE SOURCE rather
   * than copied into this file -- a copy is not a check, and a tenth
   * `CTALocation` added in `lib/analytics.ts` has to break something here.
   *
   * Source-read rather than type-level because `tsconfig.json` excludes test
   * files from the compile: a `satisfies`/`never` guard written in here is
   * never type-checked and would pass forever. `consent-routes.test.ts` reads
   * the route folder for the same reason.
   */
  const declaredCTALocations = (): string[] => {
    const source = readFileSync(join(import.meta.dir, "analytics.ts"), "utf-8");
    const union = source.match(/export type CTALocation =([\s\S]*?);/);
    expect(union).not.toBeNull();
    return [...(union as RegExpMatchArray)[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  };

  test("the union is non-trivial — the parse itself has to be checked", () => {
    // If the regex above silently stopped matching, every assertion below
    // would pass over an empty list.
    const locations = declaredCTALocations();
    expect(locations.length).toBeGreaterThanOrEqual(9);
    expect(locations).toContain("hero");
    expect(locations).toContain("loyalty_picker");
  });

  test("every declared CTA location maps to an event", () => {
    const unmapped = declaredCTALocations().filter(
      // The default href, i.e. a CTAButton with no href prop.
      (location) => gaEventForCTA({ ctaLocation: location, href: "/onboarding" }) === null,
    );

    expect(unmapped).toEqual([]);
  });

  test("the demo CTAs are the ones that map to contact", () => {
    // Pins the split, not just the coverage: a signup CTA quietly reclassified
    // as a contact would keep "every location maps" green.
    const byEvent = (event: string) =>
      declaredCTALocations().filter(
        (location) => gaEventForCTA({ ctaLocation: location, href: "/onboarding" }) === event,
      );

    expect(byEvent("contact_cta_click").sort()).toEqual(["final_cta_demo", "hero_demo"]);
    expect(byEvent("sign_up_cta_click")).toContain("hero");
    expect(byEvent("sign_up_cta_click")).toContain("pricing_growth");
  });
});

describe("readMeasurementId — the shapes a paste actually takes", () => {
  test("a lowercase id is accepted", () => {
    // The regex carries /i deliberately; pin it so a later tightening is a
    // decision rather than an accident.
    expect(readMeasurementId("g-zfz6jlpfxn")).toBe("g-zfz6jlpfxn");
  });

  test("the prefix alone is not an id", () => {
    expect(readMeasurementId("G-")).toBeNull();
  });

  test("a pasted URL is rejected", () => {
    expect(
      readMeasurementId("https://analytics.google.com/…/G-ZFZ6JLPFXN")
    ).toBeNull();
  });

  test("an id with inner whitespace or punctuation is rejected", () => {
    expect(readMeasurementId("G-ZFZ6 JLPFXN")).toBeNull();
    expect(readMeasurementId("G_ZFZ6JLPFXN")).toBeNull();
  });
});

describe("readDebugMode", () => {
  test("the documented query flag turns DebugView on", () => {
    expect(readDebugMode("?debug_mode=1")).toBe(true);
    expect(readDebugMode("?utm_source=x&debug_mode=1")).toBe(true);
  });

  test("anything else leaves it off", () => {
    expect(readDebugMode("")).toBe(false);
    expect(readDebugMode("?debug_mode=0")).toBe(false);
    expect(readDebugMode("?debug_mode=true")).toBe(false);
  });
});

describe("the browser side, in load order", () => {
  /**
   * `initialised` is MODULE state -- it has to be, because it models "has this
   * page injected the tag", which is a fact about the page and not about any
   * caller. So these tests are a SEQUENCE, not a set: each one runs against
   * the state the previous left behind, exactly as a real page does. They read
   * top to bottom as the life of one page load.
   *
   * This is what the audit found missing: above, `loaded` is a boolean the
   * test hands in. Here it is `isGaLoaded()`, so deleting the guard inside
   * `trackGaEvent` makes these fail.
   */
  type FakeEl = { async?: boolean; src?: string };

  const appended: FakeEl[] = [];

  function installBrowser(search: string): Record<string, unknown> {
    appended.length = 0;
    const fakeWindow: Record<string, unknown> = {
      location: { search, href: "https://stampeo.app/us/pricing" },
    };
    (globalThis as Record<string, unknown>).document = {
      createElement: (): FakeEl => ({}),
      head: {
        appendChild: (el: FakeEl) => {
          appended.push(el);
        },
      },
      title: "Stampeo",
      body: { dataset: {} as Record<string, string> },
    };
    (globalThis as Record<string, unknown>).window = fakeWindow;
    return fakeWindow;
  }

  /** Records every gtag call so a NON-call can be asserted. */
  function spyGtag(win: Record<string, unknown>): unknown[][] {
    const calls: unknown[][] = [];
    win.gtag = (...args: unknown[]) => {
      calls.push(args);
    };
    return calls;
  }

  afterAll(() => {
    delete (globalThis as Record<string, unknown>).document;
    delete (globalThis as Record<string, unknown>).window;
  });

  test("before the tag loads, a click sends nothing", () => {
    // AC11. gtag EXISTS here -- a leftover from another script, or the stub of
    // a tag still downloading. The event must still be dropped, because what
    // gates it is our own `initialised`, not the presence of a global.
    const win = installBrowser("");
    const calls = spyGtag(win);

    expect(isGaLoaded()).toBe(false);
    trackGaEvent({ event: "sign_up_cta_click", trackable: true, params: {} });

    expect(calls).toEqual([]);
  });

  test("initGa injects gtag.js once, configured for the property", () => {
    // AC1/AC4. A fresh window with NO gtag, so the dataLayer stub is the one
    // under test rather than a spy.
    const win = installBrowser("?debug_mode=1");
    initGa(MEASUREMENT_ID);

    expect(appended.length).toBe(1);
    expect(appended[0].src).toBe(gaScriptSrc(MEASUREMENT_ID));
    expect(appended[0].async).toBe(true);
    expect(isGaLoaded()).toBe(true);

    // The stub must push the `arguments` OBJECT, not a spread array -- gtag.js
    // reads `arguments.length` off what it finds queued.
    const queue = win.dataLayer as unknown[];
    const calls = queue.map((entry) => Array.from(entry as IArguments));
    expect(calls[0][0]).toBe("js");
    expect(calls[1][0]).toBe("config");
    expect(calls[1][1]).toBe(MEASUREMENT_ID);
    // `?debug_mode=1` is the documented operator instruction; passing it
    // through is what makes that instruction true.
    expect(calls[1][2]).toEqual({ debug_mode: true });
  });

  test("a second call injects nothing — strict mode mounts effects twice", () => {
    initGa(MEASUREMENT_ID);
    expect(appended.length).toBe(1);
  });

  test("once loaded, a click on a marketing page sends the event", () => {
    const win = installBrowser("");
    const calls = spyGtag(win);

    trackGaEvent({
      event: "sign_up_cta_click",
      trackable: isTrackablePath("/us/pricing"),
      params: { cta_location: "hero", locale: "en", href: "/onboarding" },
    });

    expect(calls).toEqual([
      [
        "event",
        "sign_up_cta_click",
        { cta_location: "hero", locale: "en", href: "/onboarding" },
      ],
    ]);
  });

  test("the same click on a private page sends nothing, tag loaded or not", () => {
    // AC7/AC11. The tag IS loaded at this point -- that is the whole risk.
    const win = installBrowser("");
    const calls = spyGtag(win);

    expect(isGaLoaded()).toBe(true);
    trackGaEvent({
      event: "sign_up_cta_click",
      trackable: isTrackablePath("/onboarding"),
      params: {},
    });

    expect(calls).toEqual([]);
  });

  test("a page view carries the path it navigated to", () => {
    // AC8. `page_path` must be the NEW path; gtag only sends one itself, at
    // load, and every App Router navigation after that is ours to report.
    const win = installBrowser("");
    const calls = spyGtag(win);

    trackGaPageView({ path: "/fr/tarifs", trackable: true });

    expect(calls.length).toBe(1);
    expect(calls[0][0]).toBe("event");
    expect(calls[0][1]).toBe("page_view");
    expect(calls[0][2]).toEqual({
      page_path: "/fr/tarifs",
      page_location: "https://stampeo.app/us/pricing",
      page_title: "Stampeo",
    });
  });

  test("a throw from gtag cannot break the click", () => {
    // plan.md: "a throw inside a click handler breaks navigation site-wide;
    // the GA send must be fully guarded". An ad blocker replacing `gtag` with
    // something hostile, or a CSP violation, must cost the event and nothing
    // else -- the visitor still navigates.
    const win = installBrowser("");
    win.gtag = () => {
      throw new Error("blocked by extension");
    };

    expect(() =>
      trackGaEvent({ event: "sign_up_cta_click", trackable: true, params: {} })
    ).not.toThrow();
  });

  test("a page view survives a throwing gtag too", () => {
    const win = installBrowser("");
    win.gtag = () => {
      throw new Error("blocked by extension");
    };

    expect(() => trackGaPageView({ path: "/pricing", trackable: true })).not.toThrow();
  });

  test("events carry the landing A/B variant", () => {
    // plan.md: the `landing_variant` super-property is PostHog-only, so GA4
    // events must carry it explicitly or the two tools disagree about which
    // variant earned the signup. `LandingTracker` publishes it on <body>.
    const win = installBrowser("");
    const calls = spyGtag(win);
    (
      (globalThis as Record<string, unknown>).document as {
        body: { dataset: Record<string, string> };
      }
    ).body.dataset.landingVariant = "b";

    trackGaEvent({
      event: "sign_up_cta_click",
      trackable: true,
      params: { cta_location: "hero" },
    });

    expect(calls[0][2]).toEqual({ cta_location: "hero", landing_variant: "b" });
  });

  test("off the landing page, no variant is invented", () => {
    // Absent means absent: a default like "a" would silently credit the
    // control for every signup that started somewhere else.
    const win = installBrowser("");
    const calls = spyGtag(win);

    trackGaEvent({ event: "sign_up_cta_click", trackable: true, params: {} });

    expect(calls[0][2]).toEqual({});
  });

  test("a page view on a private route sends nothing", () => {
    const win = installBrowser("");
    const calls = spyGtag(win);

    trackGaPageView({ path: "/onboarding", trackable: isTrackablePath("/onboarding") });

    expect(calls).toEqual([]);
  });
});
