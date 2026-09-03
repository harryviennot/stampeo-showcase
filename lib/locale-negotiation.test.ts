/**
 * Locale negotiation for the public acquisition pages.
 *
 * These are the pages a stranger lands on after scanning a QR code in a shop.
 * They get one shot at being readable: there is no account, no saved
 * preference, and nobody to complain to. The rules below are the ones that
 * decide which language that stranger sees.
 */

import { describe, expect, test } from "bun:test";
import { readdirSync } from "node:fs";
import { join } from "node:path";

import { routing } from "../i18n/routing";
import {
  RESERVED_TOP_SEGMENTS,
  acquisitionSlug,
  deviceLanguage,
  resolveAcquisitionLocale,
} from "./locale-negotiation";

describe("deviceLanguage", () => {
  test("matches a region-qualified tag to its base language", () => {
    expect(deviceLanguage("pl-PL")).toBe("pl");
    expect(deviceLanguage("fr-CA")).toBe("fr");
    expect(deviceLanguage("es-419")).toBe("es");
    expect(deviceLanguage("en-GB")).toBe("en");
  });

  test("reads a real phone's header, not just the first tag", () => {
    // What an Android phone set to Polish actually sends. `pl` wins on q, even
    // though `en` appears twice further down the list.
    expect(deviceLanguage("pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7")).toBe("pl");
  });

  test("ranks by q, not by position", () => {
    expect(deviceLanguage("en;q=0.5,pl;q=0.9")).toBe("pl");
    expect(deviceLanguage("es;q=0.7,pl;q=0.9")).toBe("pl");
  });

  test("treats a missing q as 1", () => {
    expect(deviceLanguage("pl,en;q=0.9")).toBe("pl");
    expect(deviceLanguage("en;q=0.9,pl")).toBe("pl");
  });

  test("only the top-ranked language counts", () => {
    // Chrome appends `en` to almost every header it sends, so a supported
    // language further down the list is the browser's fallback chain and not
    // the reader's choice. Reading it as a choice is what put English in front
    // of people whose phones were set to something else entirely.
    expect(deviceLanguage("uk-UA,uk;q=0.9,en;q=0.8")).toBeNull();
    expect(deviceLanguage("de-DE,de;q=0.9,en;q=0.8")).toBeNull();
    expect(deviceLanguage("cs-CZ,cs;q=0.9,fr;q=0.8")).toBeNull();
  });

  test("honours a device genuinely set to a language we serve", () => {
    expect(deviceLanguage("en-US,en;q=0.9,pl;q=0.8")).toBe("en");
    expect(deviceLanguage("pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7")).toBe("pl");
    expect(deviceLanguage("fr-FR,fr;q=0.9,en;q=0.8")).toBe("fr");
  });

  test("returns null when nothing in the header is supported", () => {
    expect(deviceLanguage("de-DE,de;q=0.9")).toBeNull();
    expect(deviceLanguage("cs,sk;q=0.9")).toBeNull();
  });

  test("returns null for a header that carries no preference", () => {
    // An in-app WebView (Instagram, Messenger, some QR scanners) can send any
    // of these. None of them is a signal, so none of them may beat the shop.
    expect(deviceLanguage(null)).toBeNull();
    expect(deviceLanguage(undefined)).toBeNull();
    expect(deviceLanguage("")).toBeNull();
    expect(deviceLanguage("   ")).toBeNull();
    expect(deviceLanguage("*")).toBeNull();
  });

  test("ignores q=0, which means 'not this one'", () => {
    expect(deviceLanguage("fr;q=0")).toBeNull();
    expect(deviceLanguage("fr;q=0,pl;q=0.5")).toBe("pl");
  });

  test("survives a malformed header instead of throwing", () => {
    // A malformed q drops that entry, so `en` becomes the top-ranked one.
    expect(deviceLanguage("pl;q=abc,en;q=0.9")).toBe("en");
    expect(deviceLanguage(",,;;,")).toBeNull();
    expect(deviceLanguage("pl;;q=0.9")).toBe("pl");
  });

  test("is case-insensitive", () => {
    expect(deviceLanguage("PL-pl")).toBe("pl");
    expect(deviceLanguage("EN-US;Q=0.9")).toBe("en");
  });
});

describe("acquisitionSlug", () => {
  test("recognises the URL a QR code encodes", () => {
    expect(acquisitionSlug("/usual-cafe")).toBe("usual-cafe");
  });

  test("recognises the per-store enrollment URL", () => {
    expect(acquisitionSlug("/usual-cafe/l/rue-de-rivoli")).toBe("usual-cafe");
  });

  test("tolerates a trailing slash", () => {
    expect(acquisitionSlug("/usual-cafe/")).toBe("usual-cafe");
  });

  test("returns null when the visitor already picked a locale", () => {
    // A locale in the URL is an explicit choice. Nothing may override it.
    for (const locale of routing.locales) {
      expect(acquisitionSlug(`/${locale}/usual-cafe`)).toBeNull();
      expect(acquisitionSlug(`/${locale}/usual-cafe/l/rue-de-rivoli`)).toBeNull();
    }
  });

  test("returns null for the marketing site", () => {
    expect(acquisitionSlug("/")).toBeNull();
    expect(acquisitionSlug("/pricing")).toBeNull();
    expect(acquisitionSlug("/blog/how-loyalty-works")).toBeNull();
    expect(acquisitionSlug("/programme-fidelite")).toBeNull();
    expect(acquisitionSlug("/uk")).toBeNull();
  });

  test("returns null for a shape that is not an enrollment URL", () => {
    // Only `/{slug}` and `/{slug}/l/{store}` are acquisition routes; anything
    // else with a business-shaped first segment is a 404, not a page to
    // negotiate a language for.
    expect(acquisitionSlug("/usual-cafe/menu")).toBeNull();
    expect(acquisitionSlug("/usual-cafe/l/rue-de-rivoli/extra")).toBeNull();
  });

  test("every static route under app/[locale] is reserved", () => {
    // A static route folder that is missing from RESERVED_TOP_SEGMENTS would be
    // treated as a business slug, and we would call the API on every page view
    // of it. Driven off the filesystem so a new marketing page cannot drift.
    const staticRoutes = readdirSync(join(import.meta.dir, "..", "app", "[locale]"), {
      withFileTypes: true,
    })
      .filter((e) => e.isDirectory() && !e.name.startsWith("["))
      .map((e) => e.name);

    expect(staticRoutes.length).toBeGreaterThan(0);
    for (const route of staticRoutes) {
      expect(RESERVED_TOP_SEGMENTS.has(route)).toBe(true);
    }
  });
});

describe("resolveAcquisitionLocale", () => {
  test("a saved choice beats everything", () => {
    expect(
      resolveAcquisitionLocale({
        cookieLocale: "en",
        acceptLanguage: "pl-PL,pl;q=0.9",
        businessLocale: "fr",
      })
    ).toEqual({ locale: "en", source: "cookie" });
  });

  test("the phone's language beats the shop's language", () => {
    // A French tourist in a Polish bakery reads French.
    expect(
      resolveAcquisitionLocale({
        cookieLocale: null,
        acceptLanguage: "fr-FR,fr;q=0.9",
        businessLocale: "pl",
      })
    ).toEqual({ locale: "fr", source: "header" });
  });

  test("falls back to the shop's language when the phone says nothing useful", () => {
    // This is the bug: a Polish shop used to serve French here, because `fr`
    // is the site-wide default.
    expect(
      resolveAcquisitionLocale({
        cookieLocale: null,
        acceptLanguage: null,
        businessLocale: "pl",
      })
    ).toEqual({ locale: "pl", source: "business" });

    expect(
      resolveAcquisitionLocale({
        cookieLocale: null,
        acceptLanguage: "de-DE,de;q=0.9",
        businessLocale: "pl",
      })
    ).toEqual({ locale: "pl", source: "business" });

    // A German phone in a Polish bakery. The trailing `en;q=0.8` is Chrome's,
    // not the reader's, so the bakery's own language wins over it.
    expect(
      resolveAcquisitionLocale({
        cookieLocale: null,
        acceptLanguage: "de-DE,de;q=0.9,en;q=0.8",
        businessLocale: "pl",
      })
    ).toEqual({ locale: "pl", source: "business" });
  });

  test("ignores a cookie that is not a locale we serve", () => {
    expect(
      resolveAcquisitionLocale({
        cookieLocale: "de",
        acceptLanguage: null,
        businessLocale: "pl",
      })
    ).toEqual({ locale: "pl", source: "business" });

    expect(
      resolveAcquisitionLocale({
        cookieLocale: "",
        acceptLanguage: "pl",
        businessLocale: "fr",
      })
    ).toEqual({ locale: "pl", source: "header" });
  });

  test("ignores a business locale we do not serve", () => {
    // `primary_locale` is a plain string on the API. An unknown value must not
    // reach next-intl, which would 404 on an unknown segment.
    expect(
      resolveAcquisitionLocale({
        cookieLocale: null,
        acceptLanguage: null,
        businessLocale: "de",
      })
    ).toEqual({ locale: routing.defaultLocale, source: "default" });
  });

  test("uses the site default only when there is nothing else at all", () => {
    expect(
      resolveAcquisitionLocale({
        cookieLocale: null,
        acceptLanguage: null,
        businessLocale: null,
      })
    ).toEqual({ locale: routing.defaultLocale, source: "default" });
  });

  test("resolves to a locale next-intl actually serves, whatever the input", () => {
    const junk = [null, undefined, "", "  ", "de", "zz-ZZ", "en_US", "../fr"];
    for (const cookieLocale of junk) {
      for (const businessLocale of junk) {
        const { locale } = resolveAcquisitionLocale({
          cookieLocale,
          acceptLanguage: "zz-ZZ",
          businessLocale,
        });
        expect(routing.locales).toContain(locale);
      }
    }
  });
});
