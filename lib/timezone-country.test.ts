/**
 * The timezone table, for the US.
 *
 * The consent gate reads a visitor's region from their IANA timezone. A zone
 * the table misses is read as "unknown", which is held to the opt-in banner:
 * safe, but it shows the European banner to someone in Louisville and hides the
 * US price from someone in Fairbanks. Every zone whose country is the US maps to
 * US. The territories do not: they are held to the strict row until each one is
 * reviewed.
 */

import { describe, expect, test } from "bun:test";

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
});
