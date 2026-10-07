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

import { afterAll, describe, expect, test } from "bun:test";
import { resolveConsent } from "./consent";
import { isTrackablePath } from "./consent-routes";
import { ctaClick } from "./cta/events";
import { GRANTED_COOKIE, REFUSED_COOKIE } from "./privacy/__fixtures__/fake-browser";
import { rowFor } from "./privacy/policy";
import {
  META_PIXEL_SCRIPT_SRC,
  initMetaPixel,
  isMetaPixelLoaded,
  metaEventForContactForm,
  metaEventForCTA,
  metaEventForLink,
  readMetaPixelId,
  shouldLoadMetaPixel,
  shouldSendMetaEvent,
  shouldSendMetaPageView,
  shouldSendViewContent,
  trackMetaEvent,
  viewContentCategory,
  type MetaEvent,
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

  test("a GA4 measurement id is rejected", () => {
    // Two tags, two env vars, adjacent lines in .env.example — the mirror of
    // `readMeasurementId` rejecting a numeric Meta id. `fbq('init', 'G-…')`
    // would be a live tag pointed at nothing, which looks exactly like
    // working tracking.
    expect(readMetaPixelId("G-ZFZ6JLPFXN")).toBeNull();
  });

  test("anything non-numeric is rejected", () => {
    expect(readMetaPixelId("pixel-123")).toBeNull();
    expect(readMetaPixelId("108815832375071O")).toBeNull(); // letter O, not zero
    expect(readMetaPixelId("https://business.facebook.com/…/1088158323750710")).toBeNull();
  });

  test("an implausible length is rejected", () => {
    // Real pixel ids run 15-16 digits today; 5-20 leaves headroom without
    // accepting a stray "1" or a pasted concatenation.
    expect(readMetaPixelId("1234")).toBeNull();
    expect(readMetaPixelId("1".repeat(21))).toBeNull();
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
    const state = resolveConsent({ record: null, prior: null, row: rowFor("US"), gpc: false });
    expect(state.marketing).toBe(true);
    expect(
      shouldLoadMetaPixel({ ...LOADABLE, marketing: state.marketing }),
    ).toBe(true);
  });

  test("a US visitor sending GPC loads nothing", () => {
    // GPC is a legally binding opt-out in twelve states and is honoured before
    // any regime default.
    const state = resolveConsent({ record: null, prior: null, row: rowFor("US"), gpc: true });
    expect(
      shouldLoadMetaPixel({ ...LOADABLE, marketing: state.marketing }),
    ).toBe(false);
  });

  test("a European visitor with no stored choice loads nothing", () => {
    const state = resolveConsent({ record: null, prior: null, row: rowFor("FR"), gpc: false });
    expect(
      shouldLoadMetaPixel({ ...LOADABLE, marketing: state.marketing }),
    ).toBe(false);
  });

  test("a visitor who accepted analytics but refused marketing loads nothing", () => {
    // The categories are independent. GA4 (STA-318) may run while this does not.
    const state = resolveConsent({
      record: { v: 1, analytics: true, marketing: false, at: 0, regime: "opt-in" },
      prior: null,
      row: rowFor("FR"),
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

describe("shouldSendMetaPageView", () => {
  /**
   * The deliberate mirror of `shouldSendPageView` in `lib/google-analytics.ts`
   * — same inputs, same rules, tested here so the Meta component keeps zero
   * untested branches. `lastPath` is the last path the component SAW (updated
   * on every navigation, untrackable ones included) and `alreadyLoaded` is
   * whether the script was resident before the effect run being decided.
   */
  const RESIDENT = {
    loaded: true,
    trackable: true,
    alreadyLoaded: true,
    lastPath: "/pricing",
  };

  test("a client-side navigation to a new path sends one", () => {
    expect(shouldSendMetaPageView({ ...RESIDENT, nextPath: "/about" })).toBe(true);
  });

  test("a same-path re-render does not send", () => {
    // Strict mode, or a consent change re-running the effect on one path.
    expect(shouldSendMetaPageView({ ...RESIDENT, nextPath: "/pricing" })).toBe(false);
  });

  test("the init run is silent — init fires its own PageView", () => {
    expect(
      shouldSendMetaPageView({
        ...RESIDENT,
        alreadyLoaded: false,
        lastPath: null,
        nextPath: "/pricing",
      }),
    ).toBe(false);
  });

  test("a remount with the pixel already resident sends for the current path", () => {
    // The locale switch remounts the [locale] tree: ref null, module state
    // still initialised. The post-switch path never got a PageView.
    expect(
      shouldSendMetaPageView({
        ...RESIDENT,
        lastPath: null,
        nextPath: "/en",
      }),
    ).toBe(true);
  });

  test("returning to a trackable path after a private detour sends one", () => {
    // /pricing → /onboarding (silent, but SEEN) → /pricing. The QA GA-02
    // shape, which Meta shares: tracking the last SENT path instead of the
    // last seen one suppressed the return forever.
    expect(
      shouldSendMetaPageView({
        ...RESIDENT,
        lastPath: "/onboarding",
        nextPath: "/pricing",
      }),
    ).toBe(true);
  });

  test("a non-trackable path never sends", () => {
    expect(
      shouldSendMetaPageView({ ...RESIDENT, trackable: false, nextPath: "/onboarding" }),
    ).toBe(false);
  });

  test("an unloaded pixel never sends", () => {
    expect(
      shouldSendMetaPageView({
        ...RESIDENT,
        loaded: false,
        alreadyLoaded: false,
        nextPath: "/about",
      }),
    ).toBe(false);
  });
});

describe("metaEventForCTA", () => {
  // Which event each location sends is tabled once, in lib/cta/events.test.ts.
  // These are the rules that table relies on.

  test("a signup location is a SignupCTA, never a Lead", () => {
    // The click leaves showcase for the app and we do not observe whether an
    // account was created. The Lead is the server's, sent when the account is
    // confirmed, so the browser's custom event can never be mistaken for it.
    expect(metaEventForCTA({ ctaLocation: "hero", href: "/onboarding" })).toBe("SignupCTA");
  });

  test.each(["hero_demo", "footer_contact", "faq_contact", "pricing_contact"])(
    "the contact location %s sends nothing: it only navigates to the contact page",
    (ctaLocation) => {
      expect(metaEventForCTA({ ctaLocation, href: "/contact" })).toBeNull();
      expect(metaEventForCTA({ ctaLocation, href: "/onboarding" })).toBeNull();
    },
  );

  test.each(["/contact", "/contact?type=demo", "/en/contact", "/es/contact", "/en/us/contact"])(
    "a signup location repointed at %s sends nothing",
    (href) => {
      // The destination decides when it disagrees with the location name, as it
      // does for PostHog: a visit to the contact page is not a signup.
      expect(metaEventForCTA({ ctaLocation: "hero", href })).toBeNull();
    },
  );

  test("an unmapped CTA location is silent", () => {
    // A CTA added later sends nothing until someone maps it: a missing event is
    // a gap in a dashboard, a wrong one is a campaign optimising against noise.
    expect(metaEventForCTA({ ctaLocation: "newsletter_signup", href: "/x" })).toBeNull();
    expect(metaEventForCTA({ ctaLocation: "", href: "/onboarding" })).toBeNull();
  });
});

describe("metaEventForLink: a way to reach us that leaves the page", () => {
  test.each([
    "mailto:hello@stampeo.app",
    "mailto:hello@stampeo.app?subject=Demo",
    "tel:+33649370470",
    "TEL:+33649370470",
    "https://wa.me/33649370470",
    "https://wa.me/33649370470?text=Bonjour",
    "http://wa.me/33649370470",
  ])("%s is a Contact", (href) => {
    expect(metaEventForLink(href)).toBe("Contact");
  });

  test.each([
    ["the contact page, which only navigates", "/contact"],
    ["the contact page with its locale", "/en/contact?type=demo"],
    ["the signup page", "/onboarding"],
    ["a site that merely mentions it", "https://example.com/?next=mailto:x@y.z"],
    ["a look-alike WhatsApp host", "https://wa.me.evil.example/1"],
    ["another host's wa.me path", "https://example.com/wa.me/1"],
    ["a telephone-looking path", "/tel:123"],
    ["an empty href", ""],
  ])("%s is not", (_case, href) => {
    expect(metaEventForLink(href)).toBeNull();
  });
});

describe("metaEventForContactForm: the form's answer", () => {
  test.each([200, 201, 202, 204, 299])("a %d is a Contact", (status) => {
    expect(metaEventForContactForm(status)).toBe("Contact");
  });

  test.each([0, 100, 301, 400, 404, 422, 429, 500, 503])(
    "a %d is not: nothing was sent to us",
    (status) => {
      expect(metaEventForContactForm(status)).toBeNull();
    },
  );
});

describe("ViewContent: the pricing and features pages", () => {
  test.each([
    ["/pricing", "pricing"],
    ["/en/pricing", "pricing"],
    ["/fr/pricing/", "pricing"],
    ["/us/pricing", "pricing"],
    ["/uk/pricing", "pricing"],
    ["/en/us/pricing", "pricing"],
    ["/pl/pricing?plan=growth#faq", "pricing"],
    ["/features/design-de-carte", "features"],
    ["/en/features/card-design", "features"],
    ["/features", "features"],
    ["/es/features/scanner-mobile", "features"],
  ])("%s is %s", (path, category) => {
    expect(viewContentCategory(path)).toBe(category);
  });

  test.each([
    "/",
    "/us",
    "/en",
    "/about",
    "/blog/pricing",
    "/pricing-guide",
    "/contact",
    "/onboarding",
    "/login",
    "/mon-cafe",
    "/en/mon-cafe/pricing",
    "pricing",
    "",
  ])("%s is neither", (path) => {
    expect(viewContentCategory(path)).toBeNull();
  });

  const SENDABLE = { loaded: true, trackable: true, category: "pricing", alreadySent: false } as const;

  test("a page that is viewed for the first time this load sends one", () => {
    expect(shouldSendViewContent(SENDABLE)).toBe(true);
    expect(shouldSendViewContent({ ...SENDABLE, category: "features" })).toBe(true);
  });

  test.each([
    ["a page that already sent one", { alreadySent: true }],
    ["a page that is neither", { category: null }],
    ["a pixel that never loaded", { loaded: false }],
    ["a path where no tag may run", { trackable: false }],
  ])("%s sends nothing", (_case, over) => {
    expect(shouldSendViewContent({ ...SENDABLE, ...over })).toBe(false);
  });
});

describe("no Meta event is reported from a private route (AC5.2)", () => {
  const PRIVATE_PATHS = [
    "/onboarding",
    "/en/onboarding",
    "/login",
    "/fr/login",
    "/reset-password",
    "/en/reset-password",
    "/email-preferences",
    "/es/email-preferences",
    // A business's enrollment page, reached by scanning a QR code on a counter.
    "/mon-cafe",
    "/en/mon-cafe",
  ];

  test.each(PRIVATE_PATHS)("a resident pixel stays silent on %s, after a client-side hop", (path) => {
    const trackable = isTrackablePath(path);

    // PageView: the router moved here from a marketing page.
    expect(
      shouldSendMetaPageView({
        loaded: true,
        trackable,
        alreadyLoaded: true,
        lastPath: "/pricing",
        nextPath: path,
      }),
    ).toBe(false);
    // ViewContent, SignupCTA and Contact all pass through the same send gate.
    expect(shouldSendMetaEvent({ loaded: true, trackable })).toBe(false);
    expect(
      shouldSendViewContent({
        loaded: true,
        trackable,
        category: viewContentCategory(path),
        alreadySent: false,
      }),
    ).toBe(false);
    // A click on a signup CTA there reports to PostHog only.
    expect(
      ctaClick({ ctaLocation: "header", href: "/onboarding", pathname: path, locale: "en" })
        .trackable,
    ).toBe(false);
  });
});

/* -------------------------------------------------------------------------
 * The browser side. `bun test lib` has no DOM, so each case installs the two
 * globals the pixel touches.
 * ---------------------------------------------------------------------- */

type FakeEl = { async?: boolean; src?: string };
type FbqLike = ((...args: unknown[]) => void) & Record<string, unknown>;

/**
 * A window, holding `fbq` when one already exists (our stub from an earlier
 * load, or an extension's shim), and a document whose `<head>` hands each
 * appended script, with the window at that moment, to `onAppend`.
 */
function installBrowser(
  options: {
    fbq?: unknown;
    onAppend?: (el: FakeEl, win: Record<string, unknown>) => void;
    /** The consent cookie; a visitor who accepted everything unless said otherwise. */
    cookie?: string;
  } = {},
): Record<string, unknown> {
  const win: Record<string, unknown> = {};
  if (options.fbq) win.fbq = options.fbq;
  (globalThis as Record<string, unknown>).window = win;
  (globalThis as Record<string, unknown>).document = {
    createElement: (): FakeEl => ({}),
    head: { appendChild: (el: FakeEl) => options.onAppend?.(el, win) },
    cookie: options.cookie ?? GRANTED_COOKIE,
  };
  return win;
}

/** An fbq that records every call, so a NON-call can be asserted. */
function recordingFbq(): { fbq: (...args: unknown[]) => void; calls: unknown[][] } {
  const calls: unknown[][] = [];
  return { fbq: (...args: unknown[]) => void calls.push(args), calls };
}

const throwingFbq = () => {
  throw new Error("blocked by extension");
};

afterAll(() => {
  delete (globalThis as Record<string, unknown>).document;
  delete (globalThis as Record<string, unknown>).window;
});

describe("the browser side, in load order", () => {
  /**
   * `initialised` is MODULE state — it models "has this page injected the
   * pixel", a fact about the page and not about any caller. So these tests are
   * a SEQUENCE, not a set: each runs against the state the previous left
   * behind, exactly as a real page does. The shape mirrors the GA suite in
   * `lib/google-analytics.test.ts`.
   */
  const appended: FakeEl[] = [];
  const recordAppends = (el: FakeEl) => void appended.push(el);

  test("before the pixel loads, an event sends nothing", () => {
    // fbq EXISTS here — an extension's shim, or a stub still downloading. The
    // event must still drop, because what gates it is our own `initialised`.
    const { fbq, calls } = recordingFbq();
    installBrowser({ fbq, onAppend: recordAppends });

    expect(isMetaPixelLoaded()).toBe(false);
    trackMetaEvent({ event: "SignupCTA", trackable: true });

    expect(calls).toEqual([]);
  });

  test("a hostile pre-existing fbq cannot break the init effect", () => {
    // The extension-shim case at load time: `initMetaPixel` reuses a
    // pre-existing `window.fbq`, so its init/PageView calls run through it. A
    // throw there would propagate out of the loader effect and take the page
    // tree down with it.
    installBrowser({ fbq: throwingFbq, onAppend: recordAppends });

    expect(() => initMetaPixel("1088158323750710")).not.toThrow();
    // The script element was still injected before the throwing calls.
    expect(appended.length).toBe(1);
    expect(appended[0].src).toBe(META_PIXEL_SCRIPT_SRC);
    expect(isMetaPixelLoaded()).toBe(true);
  });

  test("a second init injects nothing — strict mode mounts effects twice", () => {
    initMetaPixel("1088158323750710");
    expect(appended.length).toBe(1);
  });

  test("once loaded, a standard event on a marketing page sends through track", () => {
    const { fbq, calls } = recordingFbq();
    installBrowser({ fbq });

    trackMetaEvent({ event: "Contact", trackable: true });
    trackMetaEvent({ event: "ViewContent", trackable: true, params: { content_category: "pricing" } });

    expect(calls).toEqual([
      ["track", "Contact", undefined],
      ["track", "ViewContent", { content_category: "pricing" }],
    ]);
  });

  test("a signup CTA is a custom event: trackCustom, with the click's context", () => {
    const { fbq, calls } = recordingFbq();
    installBrowser({ fbq });
    const params = { locale: "en", cta_location: "hero", href: "/onboarding" };

    trackMetaEvent({ event: "SignupCTA", trackable: true, params });

    expect(calls).toEqual([["trackCustom", "SignupCTA", params]]);
  });

  test("no event, standard or custom, sends from a private page, pixel loaded", () => {
    const { fbq, calls } = recordingFbq();
    installBrowser({ fbq });

    const EVENTS: MetaEvent[] = ["PageView", "ViewContent", "SignupCTA", "Contact"];
    for (const path of ["/onboarding", "/login", "/reset-password", "/email-preferences", "/mon-cafe"]) {
      for (const event of EVENTS) {
        trackMetaEvent({ event, trackable: isTrackablePath(path) });
      }
    }

    expect(calls).toEqual([]);
  });

  test("a throw from fbq cannot break the click", () => {
    // The same hardening `trackGaEvent` carries, for the same reason: every
    // call site is a click handler, and in `useCtaTracking` the Meta call runs
    // BEFORE the GA one — an unguarded throw here would cost the GA event AND
    // the navigation. Losing the measurement is the acceptable failure.
    installBrowser({ fbq: throwingFbq });

    expect(() => trackMetaEvent({ event: "SignupCTA", trackable: true })).not.toThrow();
  });
});

describe("ViewContent is sent once per page for the life of the page load (AC6.3)", () => {
  const PIXEL = "1088158323750710";
  const viewContents = (calls: unknown[][]) => calls.filter((call) => call[1] === "ViewContent");

  async function loadedPixel(tag: string, cookie?: string) {
    const { fbq, calls } = recordingFbq();
    installBrowser({ fbq, cookie });
    const pixel = await import(`./meta-pixel?${tag}`);
    pixel.initMetaPixel(PIXEL);
    calls.length = 0;
    return { pixel, calls };
  }

  test("a component that mounts again on the same page does not send it again", async () => {
    const { pixel, calls } = await loadedPixel("view-content-remount");

    pixel.reportViewContent("/pricing", true);
    pixel.reportViewContent("/pricing", true);

    expect(viewContents(calls)).toEqual([["track", "ViewContent", { content_category: "pricing" }]]);
  });

  test("each page sends its own, and coming back to one sends nothing more", async () => {
    const { pixel, calls } = await loadedPixel("view-content-pages");

    pixel.reportViewContent("/pricing", true);
    pixel.reportViewContent("/features/card-design", true);
    pixel.reportViewContent("/pricing", true);

    expect(viewContents(calls).map((call) => (call[2] as { content_category: string }).content_category)).toEqual([
      "pricing",
      "features",
    ]);
  });

  test("a page the visitor had not yet allowed it on is still due one once they do", async () => {
    const { pixel, calls } = await loadedPixel("view-content-consent", REFUSED_COOKIE);

    pixel.reportViewContent("/pricing", true);
    expect(viewContents(calls)).toEqual([]);

    (globalThis as unknown as { document: { cookie: string } }).document.cookie = GRANTED_COOKIE;
    pixel.reportViewContent("/pricing", true);
    expect(viewContents(calls)).toHaveLength(1);
  });

  test.each([
    ["a page that is neither pricing nor a feature", "about", "/about", true],
    ["a private route", "onboarding", "/onboarding", false],
  ])("%s sends none", async (_case, tag, path, trackable) => {
    const { pixel, calls } = await loadedPixel(`view-content-${tag}`);

    pixel.reportViewContent(path, trackable);

    expect(viewContents(calls)).toEqual([]);
  });
});

describe("an event is sent only while the visitor still allows it", () => {
  const PIXEL = "1088158323750710";

  async function loadedPixel(tag: string) {
    const { fbq, calls } = recordingFbq();
    installBrowser({ fbq });
    const pixel = await import(`./meta-pixel?${tag}`);
    pixel.initMetaPixel(PIXEL);
    calls.length = 0;
    return { pixel, calls };
  }
  const setCookie = (value: string) => {
    ((globalThis as Record<string, unknown>).document as { cookie: string }).cookie = value;
  };

  test("a refusal made in another tab since the pixel loaded stops every event", async () => {
    const { pixel, calls } = await loadedPixel("refused-since-load");

    pixel.trackMetaEvent({ event: "Contact", trackable: true });
    expect(calls).toHaveLength(1);

    setCookie(REFUSED_COOKIE);
    pixel.trackMetaEvent({ event: "Contact", trackable: true });
    pixel.trackMetaEvent({ event: "SignupCTA", trackable: true });
    pixel.trackMetaEvent({ event: "PageView", trackable: true });
    expect(calls).toHaveLength(1);
  });

  test("refusing advertising alone stops it, and refusing analytics alone does not", async () => {
    const { pixel, calls } = await loadedPixel("category");
    const record = (analytics: boolean, marketing: boolean) =>
      GRANTED_COOKIE.replace(/=.*/, `=${encodeURIComponent(JSON.stringify({ v: 3, a: +analytics, m: +marketing, t: 1_791_240_000, r: "opt-in", g: "EEA_UK_CH" }))}`);

    setCookie(record(false, true));
    pixel.trackMetaEvent({ event: "Contact", trackable: true });
    expect(calls).toHaveLength(1);

    setCookie(record(true, false));
    pixel.trackMetaEvent({ event: "Contact", trackable: true });
    expect(calls).toHaveLength(1);
  });
});

describe("Meta's own automatic reporting is off before the script can run", () => {
  /**
   * `fbevents.js` reports on its own unless told not to: a PageView on every
   * History API change, and (autoConfig) button clicks with page metadata.
   * Neither consults `isTrackablePath`, so once the script is resident a
   * client-side hop to `/onboarding` or `/login` reaches Meta. Only the calls
   * our gated code makes may leave the browser.
   *
   * Each case imports a FRESH module instance: `initialised` is per-page module
   * state, and these cases are each a first page load.
   */
  const PIXEL = "1088158323750710";

  /** The calls fbq received, whether queued by our stub or made on a shim. */
  function callsOn(fbq: FbqLike, recorded: unknown[][]): unknown[][] {
    return (fbq.queue as unknown[][] | undefined) ?? recorded;
  }

  test.each([
    ["a first visit (our stub queues the calls)", false],
    ["a browser where an extension already defined fbq", true],
  ])("%s", async (_label, withShim) => {
    const shim = recordingFbq();
    const flagsAtInjection: Record<string, unknown>[] = [];
    const win = installBrowser({
      fbq: withShim ? shim.fbq : undefined,
      // fbevents.js reads the flags when it installs its listeners, so they
      // must already be set when the script is injected.
      onAppend: (_el, w) => {
        const fbq = w.fbq as FbqLike;
        flagsAtInjection.push({
          disablePushState: fbq.disablePushState,
          allowDuplicatePageViews: fbq.allowDuplicatePageViews,
        });
      },
    });

    const pixel = await import(`./meta-pixel?first-load-${withShim}`);
    pixel.initMetaPixel(PIXEL);

    const fbq = win.fbq as FbqLike;
    expect(flagsAtInjection).toEqual([
      { disablePushState: true, allowDuplicatePageViews: true },
    ]);
    // `allowDuplicatePageViews` is what keeps our own client-side PageViews
    // flowing once the history listener is off.
    expect(fbq.disablePushState).toBe(true);
    expect(fbq.allowDuplicatePageViews).toBe(true);
    // autoConfig must be refused BEFORE init, or init has already armed it.
    expect(callsOn(fbq, shim.calls)).toEqual([
      ["set", "autoConfig", false, PIXEL],
      ["init", PIXEL],
      ["track", "PageView"],
    ]);
  });

  test("a frozen fbq shim that refuses the flags gets no pixel at all", async () => {
    // Loading without the flags would report private routes. Fail closed.
    const appended: FakeEl[] = [];
    installBrowser({
      fbq: Object.freeze(() => {}),
      onAppend: (el) => void appended.push(el),
    });

    const pixel = await import("./meta-pixel?frozen-shim");
    expect(() => pixel.initMetaPixel("1088158323750710")).not.toThrow();
    expect(appended).toEqual([]);
  });
});
