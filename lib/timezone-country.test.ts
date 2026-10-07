/**
 * The timezone table, for the US and for the EEA, the UK and Switzerland.
 *
 * The consent gate reads a visitor's region from their IANA timezone. A zone
 * the table misses is read as "unknown", which is held to the opt-in banner:
 * safe, but it shows the European banner to someone in Louisville and hides the
 * US price from someone in Fairbanks. Every zone whose country is the US maps to
 * US. The territories do not: they are held to the strict row until each one is
 * reviewed. Nothing outside the US list may ever map to the US: that is the
 * direction that decides whether a visitor is asked for consent.
 */

import { describe, expect, test } from "bun:test";

import { POLICY_MATRIX } from "./privacy/policy-matrix";
import { countryForTimezone } from "./timezone-country";

/** Every zone whose country is US in the IANA zone.tab. */
const US_ZONES = [
  "America/New_York", "America/Detroit", "America/Kentucky/Louisville",
  "America/Kentucky/Monticello", "America/Indiana/Indianapolis",
  "America/Indiana/Vincennes", "America/Indiana/Winamac", "America/Indiana/Marengo",
  "America/Indiana/Petersburg", "America/Indiana/Vevay", "America/Chicago",
  "America/Indiana/Tell_City", "America/Indiana/Knox", "America/Menominee",
  "America/North_Dakota/Center", "America/North_Dakota/New_Salem",
  "America/North_Dakota/Beulah", "America/Denver", "America/Boise", "America/Phoenix",
  "America/Los_Angeles", "America/Anchorage", "America/Juneau", "America/Sitka",
  "America/Metlakatla", "America/Yakutat", "America/Nome", "America/Adak",
  "Pacific/Honolulu",
];

const TERRITORIES = [
  "America/Puerto_Rico",
  "America/St_Thomas",
  "Pacific/Guam",
  "Pacific/Saipan",
  "Pacific/Pago_Pago",
];

/**
 * Names a browser may still report for a US zone: the legacy `US/*` links, the
 * pre-2000s `America/*` names the IANA backward file keeps, and `Navajo`.
 * `Intl` canonicalises most of them, but an older engine or a patched OS
 * returns them as written, and each one is a US visitor.
 */
const US_ALIASES = [
  "America/Indianapolis", "America/Fort_Wayne", "America/Knox_IN",
  "America/Louisville", "America/Atka", "America/Shiprock",
  "US/Eastern", "US/Central", "US/Mountain", "US/Pacific", "US/Alaska",
  "US/Hawaii", "US/Arizona", "US/Michigan", "US/East-Indiana",
  "US/Indiana-Starke", "US/Aleutian",
  "Navajo",
];

describe("countryForTimezone: the United States", () => {
  test.each(US_ZONES)("%s is US", (zone) => {
    expect(countryForTimezone(zone)).toBe("US");
  });

  test.each(US_ALIASES)("the alias %s is US", (zone) => {
    expect(countryForTimezone(zone)).toBe("US");
  });

  test.each(TERRITORIES)("the territory %s stays unmapped", (zone) => {
    expect(countryForTimezone(zone)).toBeNull();
  });

  test("a zone next to the border is not the US", () => {
    expect(countryForTimezone("America/Toronto")).toBe("CA");
    expect(countryForTimezone("America/Mexico_City")).toBe("MX");
  });

  test("no zone outside the US list maps to the US", () => {
    const known = new Set([...US_ZONES, ...US_ALIASES]);
    const zones = (Intl as { supportedValuesOf(key: "timeZone"): string[] }).supportedValuesOf("timeZone");

    expect(zones.length).toBeGreaterThan(300);
    const leaks = zones.filter((zone) => !known.has(zone) && countryForTimezone(zone) === "US");
    expect(leaks).toEqual([]);
  });

  test("every zone the platform places in the US is on the list", () => {
    const platform = (new Intl.Locale("und-US") as Intl.Locale & { getTimeZones(): string[] }).getTimeZones();

    expect(platform.filter((zone) => countryForTimezone(zone) !== "US")).toEqual([]);
  });
});

describe("countryForTimezone: the EEA, the UK and Switzerland", () => {
  const COUNTRIES = POLICY_MATRIX.rows.EEA_UK_CH.countries;
  const zonesOf = (country: string) =>
    (new Intl.Locale(`und-${country}`) as Intl.Locale & { getTimeZones(): string[] }).getTimeZones();

  test.each(COUNTRIES)("every zone the platform places in %s maps to it", (country) => {
    const zones = zonesOf(country);

    expect(zones.length).toBeGreaterThan(0);
    expect(zones.filter((zone) => countryForTimezone(zone) !== country)).toEqual([]);
  });

  test.each([
    ["Europe/London", "GB"],
    ["Europe/Zurich", "CH"],
    ["Europe/Oslo", "NO"],
    ["Atlantic/Canary", "ES"],
    ["Africa/Ceuta", "ES"],
    ["Atlantic/Azores", "PT"],
    ["Europe/Busingen", "DE"],
    ["Europe/Vaduz", "LI"],
    ["Atlantic/Reykjavik", "IS"],
    ["Asia/Nicosia", "CY"],
  ])("%s is %s", (zone, country) => {
    expect(countryForTimezone(zone)).toBe(country);
  });

  test.each(["Europe/Belfast", "GB", "GB-Eire", "Eire", "Europe/Nicosia", "Iceland", "Poland", "Portugal"])(
    "the legacy name %s is still its country",
    (zone) => {
      expect(COUNTRIES).toContain(countryForTimezone(zone) as string);
    },
  );

  test.each(["Etc/UTC", "UTC", "Etc/GMT", "Atlantic/Faeroe", "Europe/Gibraltar", "Europe/Isle_of_Man"])(
    "%s stays unmapped, so it is read as unknown and held to the opt-in banner",
    (zone) => {
      expect(countryForTimezone(zone)).toBeNull();
    },
  );
});
