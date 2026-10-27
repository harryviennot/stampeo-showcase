/**
 * Where a tracker may fire, and therefore where the consent banner appears.
 *
 * The dangerous mistake this file guards is `/[locale]/[slug]` — the QR
 * enrollment page a business hands to ITS customers. Those visitors are our
 * customers' customers, not ad prospects: sending them to Meta or TikTok is a
 * different and much worse thing than missing a conversion on `/pricing`.
 *
 * So the rule is an ALLOWLIST. Any segment under a locale that we have not
 * named is assumed to be a business slug. A new marketing page silently
 * missing tracking is benign and shows up as a gap in a dashboard; a café's
 * customers silently reaching an ad network is not recoverable.
 *
 * `lib/robots.ts` documents the same collision from the other side
 * (`/authentic-cafe` matching a `/auth` rule).
 */

import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { routing } from "../i18n/routing";
import { HELP_LOOKALIKE_SLUGS, HELP_PATHS } from "./help/__fixtures__/paths";
import { pagesUnder } from "./testing/app-folders";
import {
  ANALYTICS_ONLY_SEGMENTS,
  MARKETING_SEGMENTS,
  PRIVATE_SEGMENTS,
  PRIVATE_SUBPATHS,
  mayRunAdvertising,
  mayRunAnalytics,
  mayRunAnyTag,
} from "./consent-routes";

/** What a path answers to the three questions callers ask of it. */
const verdict = (path: string) => ({
  analytics: mayRunAnalytics(path),
  advertising: mayRunAdvertising(path),
  anyTag: mayRunAnyTag(path),
});
const EVERY_TAG = { analytics: true, advertising: true, anyTag: true };
const ANALYTICS_ONLY = { analytics: true, advertising: false, anyTag: true };
const NO_TAG = { analytics: false, advertising: false, anyTag: false };

describe("route classes — marketing surfaces", () => {
  test("the home page is trackable in every locale", () => {
    // French is the default locale and unprefixed (`localePrefix: "as-needed"`),
    // so `/` and `/en` are both real home pages.
    for (const path of ["/", "/en", "/es", "/pl"]) {
      expect(verdict(path)).toEqual(EVERY_TAG);
    }
  });

  test("a marketing page is trackable under every locale prefix", () => {
    for (const path of ["/pricing", "/en/pricing", "/es/pricing", "/pl/pricing"]) {
      expect(verdict(path)).toEqual(EVERY_TAG);
    }
  });

  test("the localized loyalty-program route names are trackable", () => {
    // These are four sibling FOLDERS, not one route with a translated slug, so
    // a raw match on "loyalty-programs" would leave three of them untracked.
    expect(verdict("/programme-fidelite")).toEqual(EVERY_TAG);
    expect(verdict("/en/loyalty-programs")).toEqual(EVERY_TAG);
    expect(verdict("/es/programa-de-fidelizacion")).toEqual(EVERY_TAG);
    expect(verdict("/pl/program-lojalnosciowy")).toEqual(EVERY_TAG);
  });

  test("the country pilots and everything beneath them are trackable", () => {
    // Pilots are served at locale-free URLs by a proxy rewrite, so the
    // browser path stays /us — there is no locale prefix to strip here.
    for (const path of ["/us", "/us/pricing", "/uk", "/uk/pricing"]) {
      expect(verdict(path)).toEqual(EVERY_TAG);
    }
  });

  test("the /start forwarding page is trackable, so an ad click that lands there is attributed", () => {
    for (const path of ["/start", "/en/start", "/es/start?utm_source=meta&fbclid=IwAR3x"]) {
      expect(verdict(path)).toEqual(EVERY_TAG);
    }
  });

  test("a nested marketing page is trackable", () => {
    expect(verdict("/blog/some-post")).toEqual(EVERY_TAG);
    expect(verdict("/en/features/card-design")).toEqual(EVERY_TAG);
    expect(verdict("/pl/features/wzor-karty")).toEqual(EVERY_TAG);
  });

  test("trailing slashes and query strings do not change the answer", () => {
    expect(verdict("/pricing/")).toEqual(EVERY_TAG);
    expect(verdict("/pricing?utm_source=meta")).toEqual(EVERY_TAG);
  });
});

describe("route classes — acquisition pages", () => {
  test("a business enrollment page is NOT trackable", () => {
    // The headline case. `/some-cafe` is a merchant's printed QR destination.
    for (const path of [
      "/some-cafe",
      "/en/some-cafe",
      "/fr/some-cafe",
      "/es/some-cafe",
      "/pl/some-cafe",
    ]) {
      expect(verdict(path)).toEqual(NO_TAG);
    }
  });

  test("a per-location enrollment page is NOT trackable", () => {
    expect(verdict("/some-cafe/l/centre")).toEqual(NO_TAG);
    expect(verdict("/fr/some-cafe/l/centre")).toEqual(NO_TAG);
  });

  test("a slug that merely starts like a marketing segment is NOT trackable", () => {
    // The `/authentic-cafe` vs `/auth` collision, in the tracking direction:
    // prefix matching here would leak a real business's customers.
    expect(verdict("/pricing-cafe")).toEqual(NO_TAG);
    expect(verdict("/usual-cafe")).toEqual(NO_TAG);
    expect(verdict("/blogger-coffee")).toEqual(NO_TAG);
    expect(verdict("/starter-cafe")).toEqual(NO_TAG);
  });
});

describe("route classes — private surfaces", () => {
  test("the demo wallet page, whose session token rides in its path, is NOT trackable", () => {
    for (const path of [
      "/demo/wallet-select/3f2504e0",
      "/en/demo/wallet-select/3f2504e0",
      "/fr/demo/wallet-select/3f2504e0/",
      "/es/demo/wallet-select/3f2504e0?x=1",
    ]) {
      expect(verdict(path)).toEqual(NO_TAG);
    }
  });

  test("the rest of the demo segment is still ours to measure", () => {
    expect(verdict("/demo")).toEqual(EVERY_TAG);
    expect(verdict("/en/demo/other-page")).toEqual(EVERY_TAG);
  });

  test("the funnel and account routes are NOT trackable", () => {
    // No tag fires here, so there is nothing to consent to and the banner
    // would only be in the way of someone mid-signup or unsubscribing.
    //
    // Note what this does and does not prove. Because the predicate is an
    // allowlist, these paths would also be untrackable if PRIVATE_SEGMENTS
    // were empty. The table's real job is to make the drift guard below pass
    // deliberately rather than by omission, and that is what pins it.
    for (const path of [
      "/onboarding",
      "/en/onboarding",
      "/login",
      "/reset-password",
      "/es/email-preferences",
    ]) {
      expect(verdict(path)).toEqual(NO_TAG);
    }
  });

  test("a malformed path is NOT trackable", () => {
    for (const path of ["", "pricing", "//", "/.."]) {
      expect(verdict(path)).toEqual(NO_TAG);
    }
  });
});

describe("route classes — the help center", () => {
  test.each([...HELP_PATHS, "/help/", "/help/some-page?utm_source=app#top"])(
    "%s may run analytics, never advertising, and offers the banner",
    (path) => {
      // Shops' own customers read some help pages, so no ad platform may hear
      // about them. Analytics is the one thing that runs there.
      expect(verdict(path)).toEqual(ANALYTICS_ONLY);
    },
  );

  test.each(HELP_LOOKALIKE_SLUGS.flatMap((slug) => [`/${slug}`, `/fr/${slug}`, `/${slug}/l/centre`]))(
    "a shop whose slug merely starts with help is still a shop: %s",
    (path) => {
      expect(verdict(path)).toEqual(NO_TAG);
    },
  );

  test("the analytics-only class is exactly the help center", () => {
    // Growing this table widens what a visitor on a customer-facing page is
    // measured by; it must be a deliberate decision, not a side effect.
    expect([...ANALYTICS_ONLY_SEGMENTS]).toEqual(["help"]);
  });
});

describe("each tag asks its own question", () => {
  const root = join(import.meta.dir, "..");
  const read = (file: string) => readFileSync(join(root, file), "utf-8");

  /** Which route predicates each file calls, comments left out. A new call site fails until it is listed. */
  const ASKS = {
    "components/analytics/GoogleAnalytics.tsx": ["mayRunAnalytics"],
    "components/analytics/MetaPixel.tsx": ["mayRunAdvertising"],
    "components/consent/ConsentBanner.tsx": ["mayRunAnyTag"],
    "components/contact/ContactFormClient.tsx": ["mayRunAdvertising"],
    "components/ui/ContactLink.tsx": ["mayRunAdvertising"],
    "lib/attribution/capture.ts": ["mayRunAdvertising", "mayRunAnalytics"],
    "lib/cta/events.ts": ["mayRunAdvertising", "mayRunAnalytics"],
    "lib/privacy/lifecycle.ts": ["mayRunAnyTag"],
  };

  const sourceFiles = ["app", "components", "hooks", "lib"].flatMap((dir) =>
    (readdirSync(join(root, dir), { recursive: true }) as string[])
      .filter((file) => /\.tsx?$/.test(file) && !/\.test\.tsx?$/.test(file))
      .map((file) => `${dir}/${file}`)
      .filter((file) => file !== "lib/consent-routes.ts"),
  );

  test("the Meta pixel and every Meta event ask about advertising, GA4 about analytics, the banner and the cleanup about any tag", () => {
    const asked: Record<string, string[]> = {};
    for (const file of sourceFiles) {
      const code = read(file).replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
      const predicates = [...new Set([...code.matchAll(/\b(mayRun\w+)\(/g)].map((match) => match[1]))].sort();
      if (predicates.length > 0) asked[file] = predicates;
    }

    expect(asked).toEqual(ASKS);
  });

  test("a CTA click reaches Meta on the advertising answer and GA4 on the analytics one", () => {
    const hook = read("hooks/use-cta-tracking.ts");

    expect(hook).toMatch(/trackMetaEvent\(\{[^}]*trackable:\s*click\.allowed\.advertising/);
    expect(hook).toMatch(/trackGaEvent\(\{[^}]*trackable:\s*click\.allowed\.analytics/);
  });
});

describe("segment tables", () => {
  test("no segment is in two classes", () => {
    for (const segment of MARKETING_SEGMENTS) {
      expect(PRIVATE_SEGMENTS.has(segment)).toBe(false);
      expect(ANALYTICS_ONLY_SEGMENTS.has(segment)).toBe(false);
    }
    for (const segment of ANALYTICS_ONLY_SEGMENTS) {
      expect(PRIVATE_SEGMENTS.has(segment)).toBe(false);
    }
  });

  test("no locale is claimed as a segment", () => {
    // `/es` is a locale prefix, not a page. Listing it would make the stripper
    // and the allowlist disagree about what the first segment means.
    for (const locale of routing.locales) {
      expect(MARKETING_SEGMENTS.has(locale)).toBe(false);
      expect(ANALYTICS_ONLY_SEGMENTS.has(locale)).toBe(false);
    }
  });

  test("every route folder under app/[locale] is classified", () => {
    // The drift guard. A new page added to the app router must be a deliberate
    // decision on both counts: does a tag fire there, and does the banner show
    // there. Without this, a new marketing page silently loses its tracking
    // and — far worse — a new private page silently gains it.
    const routeDir = join(import.meta.dir, "..", "app", "[locale]");
    const folders = readdirSync(routeDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      // The catch-all acquisition route is the thing the allowlist exists to
      // exclude; it is classified by NOT being named.
      .filter((name) => name !== "[slug]");

    const unclassified = folders.filter(
      (name) =>
        !MARKETING_SEGMENTS.has(name) &&
        !ANALYTICS_ONLY_SEGMENTS.has(name) &&
        !PRIVATE_SEGMENTS.has(name),
    );

    expect(unclassified).toEqual([]);
  });

  test("a private route that carries the footer is still known to be private", () => {
    // The banner predicate (`mayRunAnyTag`) gates SOLICITATION only. `/email-preferences` is
    // private — no tag may fire there — yet it renders the `Footer`, and the
    // footer carries the Cookie preferences button. Gating the preferences
    // DIALOG on this predicate therefore made that button dead on click.
    //
    // Pinned here so the relationship is on the record: if this route ever
    // becomes trackable, or another footer-bearing route joins the private
    // table, whoever changes it meets the reason the dialog is ungated.
    const footerRoutes = readdirSync(join(import.meta.dir, "..", "app", "[locale]"), {
      withFileTypes: true,
    })
      .filter((entry) => entry.isDirectory())
      .filter((entry) =>
        readdirSync(join(import.meta.dir, "..", "app", "[locale]", entry.name)).some((file) =>
          file.endsWith(".tsx") &&
          readFileSync(
            join(import.meta.dir, "..", "app", "[locale]", entry.name, file),
            "utf-8",
          ).includes("<Footer"),
        ),
      )
      .map((entry) => entry.name);

    expect(footerRoutes).toContain("email-preferences");
    expect(verdict("/email-preferences")).toEqual(NO_TAG);
  });

  test("every page that may set a cookie renders the footer that holds the privacy control", () => {
    // The privacy policy places the control in the footer of the pages where
    // the measurement and advertising cookies can be set. The sign-up, login,
    // password-reset and enrollment pages set none and carry no footer.
    const appDir = join(import.meta.dir, "..", "app", "[locale]");
    const root = join(import.meta.dir, "..");

    const resolveImport = (from: string, specifier: string) => {
      const base = specifier.startsWith("@/") ? join(root, specifier.slice(2)) : join(from, "..", specifier);
      return [`${base}.tsx`, join(base, "index.tsx")].find((file) => existsSync(file));
    };
    const rendersFooter = (file: string, seen = new Set<string>()): boolean => {
      if (seen.has(file)) return false;
      seen.add(file);
      const source = readFileSync(file, "utf-8");
      if (/<(?:Help)?Footer\b/.test(source)) return true;
      const imports = [...source.matchAll(/from "((?:@\/components|\.\.?)\/[^"]+)"/g)].map((m) => m[1]);
      return imports.some((specifier) => {
        const next = resolveImport(file, specifier);
        return next !== undefined && rendersFooter(next, seen);
      });
    };

    // The closed founding pages answer with a 308 and serve no HTML, so no
    // cookie is set on them.
    const redirectOnly = ["founding-partner", "programme-fondateur"];

    const cookiePages = [
      join(appDir, "page.tsx"),
      ...[...MARKETING_SEGMENTS]
        .filter((segment) => !redirectOnly.includes(segment))
        .filter((segment) => !PRIVATE_SUBPATHS.some(([parent]) => parent === segment))
        .flatMap((segment) => pagesUnder(join(appDir, segment))),
    ];

    // A page that returns no JSX serves no markup (it only answers 404), so it
    // sets no cookie and has nothing to hold a footer.
    const servesMarkup = (page: string) => /return\s*\(\s*</.test(readFileSync(page, "utf-8"));
    const analyticsOnlyPages = [...ANALYTICS_ONLY_SEGMENTS]
      .flatMap((segment) => pagesUnder(join(appDir, segment)))
      .filter(servesMarkup);

    expect(cookiePages.length).toBeGreaterThan(15);
    expect(analyticsOnlyPages.length).toBeGreaterThan(0);
    expect([...cookiePages, ...analyticsOnlyPages].filter((page) => !rendersFooter(page))).toEqual([]);
    for (const segment of ["login", "onboarding", "reset-password"]) {
      expect(pagesUnder(join(appDir, segment)).some((page) => rendersFooter(page))).toBe(false);
    }
  });

  test("the slim footer that help pages render in place of the full one holds the privacy control", () => {
    // `rendersFooter` above accepts `<HelpFooter` for the help routes, so it
    // must itself carry what the full footer carries: the cookie-preferences
    // control and the privacy link.
    const source = readFileSync(join(import.meta.dir, "..", "components", "help", "HelpFooter.tsx"), "utf-8");

    expect(source).toContain("<CookiePreferencesButton");
    expect(source).toContain('site("/privacy")');
  });

  test("every private sub-route still exists, under a segment that is otherwise ours", () => {
    const routeDir = join(import.meta.dir, "..", "app", "[locale]");

    for (const [segment, child] of PRIVATE_SUBPATHS) {
      expect(MARKETING_SEGMENTS.has(segment)).toBe(true);
      expect(existsSync(join(routeDir, segment, child))).toBe(true);
    }
  });

  test("every named segment still exists as a route folder", () => {
    // The other direction: a deleted or renamed page leaves a dead entry that
    // makes the table look more complete than it is.
    const routeDir = join(import.meta.dir, "..", "app", "[locale]");
    const folders = new Set(
      readdirSync(routeDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name),
    );

    const orphans = [...MARKETING_SEGMENTS, ...ANALYTICS_ONLY_SEGMENTS, ...PRIVATE_SEGMENTS].filter(
      (segment) => !folders.has(segment),
    );

    expect(orphans).toEqual([]);
  });
});
