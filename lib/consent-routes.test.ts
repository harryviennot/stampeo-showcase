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
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { routing } from "../i18n/routing";
import {
  MARKETING_SEGMENTS,
  PRIVATE_SEGMENTS,
  isTrackablePath,
} from "./consent-routes";

describe("isTrackablePath — marketing surfaces", () => {
  test("the home page is trackable in every locale", () => {
    // French is the default locale and unprefixed (`localePrefix: "as-needed"`),
    // so `/` and `/en` are both real home pages.
    for (const path of ["/", "/en", "/es", "/pl"]) {
      expect(isTrackablePath(path)).toBe(true);
    }
  });

  test("a marketing page is trackable under every locale prefix", () => {
    for (const path of ["/pricing", "/en/pricing", "/es/pricing", "/pl/pricing"]) {
      expect(isTrackablePath(path)).toBe(true);
    }
  });

  test("the localized loyalty-program route names are trackable", () => {
    // These are four sibling FOLDERS, not one route with a translated slug, so
    // a raw match on "loyalty-programs" would leave three of them untracked.
    expect(isTrackablePath("/programme-fidelite")).toBe(true);
    expect(isTrackablePath("/en/loyalty-programs")).toBe(true);
    expect(isTrackablePath("/es/programa-de-fidelizacion")).toBe(true);
    expect(isTrackablePath("/pl/program-lojalnosciowy")).toBe(true);
  });

  test("the country pilots and everything beneath them are trackable", () => {
    // Pilots are served at locale-free URLs by a middleware rewrite, so the
    // browser path stays /us — there is no locale prefix to strip here.
    for (const path of ["/us", "/us/pricing", "/uk", "/uk/pricing"]) {
      expect(isTrackablePath(path)).toBe(true);
    }
  });

  test("a nested marketing page is trackable", () => {
    expect(isTrackablePath("/blog/some-post")).toBe(true);
    expect(isTrackablePath("/en/features/card-design")).toBe(true);
    expect(isTrackablePath("/pl/features/wzor-karty")).toBe(true);
  });

  test("trailing slashes and query strings do not change the answer", () => {
    expect(isTrackablePath("/pricing/")).toBe(true);
    expect(isTrackablePath("/pricing?utm_source=meta")).toBe(true);
  });
});

describe("isTrackablePath — acquisition pages", () => {
  test("a business enrollment page is NOT trackable", () => {
    // The headline case. `/some-cafe` is a merchant's printed QR destination.
    for (const path of [
      "/some-cafe",
      "/en/some-cafe",
      "/fr/some-cafe",
      "/es/some-cafe",
      "/pl/some-cafe",
    ]) {
      expect(isTrackablePath(path)).toBe(false);
    }
  });

  test("a per-location enrollment page is NOT trackable", () => {
    expect(isTrackablePath("/some-cafe/l/centre")).toBe(false);
    expect(isTrackablePath("/fr/some-cafe/l/centre")).toBe(false);
  });

  test("a slug that merely starts like a marketing segment is NOT trackable", () => {
    // The `/authentic-cafe` vs `/auth` collision, in the tracking direction:
    // prefix matching here would leak a real business's customers.
    expect(isTrackablePath("/pricing-cafe")).toBe(false);
    expect(isTrackablePath("/usual-cafe")).toBe(false);
    expect(isTrackablePath("/blogger-coffee")).toBe(false);
  });
});

describe("isTrackablePath — private surfaces", () => {
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
      expect(isTrackablePath(path)).toBe(false);
    }
  });

  test("a malformed path is NOT trackable", () => {
    for (const path of ["", "pricing", "//", "/.."]) {
      expect(isTrackablePath(path)).toBe(false);
    }
  });
});

describe("segment tables", () => {
  test("no segment is both marketing and private", () => {
    for (const segment of MARKETING_SEGMENTS) {
      expect(PRIVATE_SEGMENTS.has(segment)).toBe(false);
    }
  });

  test("no locale is claimed as a marketing segment", () => {
    // `/es` is a locale prefix, not a page. Listing it would make the stripper
    // and the allowlist disagree about what the first segment means.
    for (const locale of routing.locales) {
      expect(MARKETING_SEGMENTS.has(locale)).toBe(false);
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
      (name) => !MARKETING_SEGMENTS.has(name) && !PRIVATE_SEGMENTS.has(name),
    );

    expect(unclassified).toEqual([]);
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

    const orphans = [...MARKETING_SEGMENTS, ...PRIVATE_SEGMENTS].filter(
      (segment) => !folders.has(segment),
    );

    expect(orphans).toEqual([]);
  });
});
