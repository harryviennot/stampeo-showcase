import type { CountryCode } from "libphonenumber-js";

/**
 * IANA timezone to country, and nothing else.
 *
 * Split out of `lib/phone-utils.ts` so a caller can ask where a visitor is
 * without pulling `libphonenumber-js` and its example-number data into the
 * bundle. The consent gate (`lib/consent.ts`) runs on EVERY page; the phone
 * field runs on two. One table, two import costs.
 *
 * `CountryCode` is a TYPE-only import, so it is erased at build time and this
 * module stays runtime-dependency-free.
 */

/**
 * Every IANA zone whose country is the US. A browser reports the zone the OS is
 * set to, not the canonical one for the region (Arizona says America/Phoenix,
 * Michigan says America/Detroit), so a missing zone costs a US visitor the
 * opt-out notice and the "see US pricing" offer. US territories are not here:
 * they stay unmapped, which holds them to the strict row.
 */
const US_ZONES: readonly string[] = [
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "America/Phoenix", "America/Anchorage", "America/Detroit", "America/Boise",
  "America/Juneau", "America/Sitka", "America/Nome", "America/Yakutat",
  "America/Metlakatla", "America/Adak", "America/Menominee",
  "America/Indiana/Indianapolis", "America/Indiana/Knox", "America/Indiana/Marengo",
  "America/Indiana/Petersburg", "America/Indiana/Tell_City", "America/Indiana/Vevay",
  "America/Indiana/Vincennes", "America/Indiana/Winamac",
  "America/Kentucky/Louisville", "America/Kentucky/Monticello",
  "America/North_Dakota/Center", "America/North_Dakota/New_Salem",
  "America/North_Dakota/Beulah", "Pacific/Honolulu",
];

/**
 * Legacy and CLDR names for US zones (`US/*`, the pre-2000s `America/*` links,
 * `Navajo`). `Intl` canonicalises most of them, but an older engine or a
 * patched OS reports them as written.
 */
const US_ALIASES: readonly string[] = [
  "America/Indianapolis", "America/Fort_Wayne", "America/Knox_IN",
  "America/Louisville", "America/Atka", "America/Shiprock",
  "US/Eastern", "US/Central", "US/Mountain", "US/Pacific", "US/Alaska",
  "US/Hawaii", "US/Arizona", "US/Michigan", "US/East-Indiana",
  "US/Indiana-Starke", "US/Aleutian", "Navajo",
];

/**
 * The zones of the EEA, the UK and Switzerland that are not a capital listed in
 * the table below, plus the legacy names a browser may report for them. Every
 * zone here belongs to the country it names; territories and dependencies
 * (Gibraltar, the Faroes, the Isle of Man) stay unmapped, which holds them to
 * the strict row.
 */
const EUROPEAN_ZONES: Record<string, CountryCode> = {
  "Europe/Sofia": "BG", "Europe/Zagreb": "HR", "Asia/Nicosia": "CY",
  "Asia/Famagusta": "CY", "Europe/Nicosia": "CY", "Europe/Tallinn": "EE",
  "Europe/Busingen": "DE", "Europe/Riga": "LV", "Europe/Vilnius": "LT",
  "Europe/Malta": "MT", "Atlantic/Azores": "PT", "Atlantic/Madeira": "PT",
  "Europe/Bratislava": "SK", "Europe/Ljubljana": "SI", "Africa/Ceuta": "ES",
  "Atlantic/Canary": "ES", "Atlantic/Reykjavik": "IS", "Europe/Vaduz": "LI",
  "Europe/Belfast": "GB", "GB": "GB", "GB-Eire": "GB", "Eire": "IE",
  "Iceland": "IS", "Poland": "PL", "Portugal": "PT",
};

const TZ_TO_COUNTRY: Record<string, CountryCode> = {
  ...Object.fromEntries([...US_ZONES, ...US_ALIASES].map((zone) => [zone, "US" as CountryCode])),
  ...EUROPEAN_ZONES,
  "Europe/Paris": "FR", "Europe/London": "GB",
  "America/Toronto": "CA", "America/Montreal": "CA", "America/Vancouver": "CA",
  "Europe/Berlin": "DE", "Europe/Madrid": "ES", "Europe/Rome": "IT",
  "Europe/Lisbon": "PT", "Europe/Brussels": "BE", "Europe/Zurich": "CH",
  "Europe/Amsterdam": "NL", "Europe/Vienna": "AT", "Europe/Dublin": "IE",
  "Europe/Luxembourg": "LU", "Europe/Stockholm": "SE", "Europe/Oslo": "NO",
  "Europe/Copenhagen": "DK", "Europe/Helsinki": "FI", "Europe/Warsaw": "PL",
  "Europe/Prague": "CZ", "Europe/Bucharest": "RO", "Europe/Budapest": "HU",
  "Europe/Athens": "GR", "Europe/Istanbul": "TR", "Europe/Moscow": "RU",
  "Europe/Kiev": "UA", "Asia/Jerusalem": "IL", "Asia/Dubai": "AE",
  "Asia/Riyadh": "SA", "Africa/Casablanca": "MA", "Africa/Tunis": "TN",
  "Africa/Algiers": "DZ", "Africa/Dakar": "SN", "Africa/Abidjan": "CI",
  "Africa/Douala": "CM", "Indian/Antananarivo": "MG", "Indian/Mauritius": "MU",
  "Indian/Reunion": "FR", "America/Guadeloupe": "FR", "America/Martinique": "FR",
  "America/Cayenne": "FR", "Pacific/Noumea": "FR", "Pacific/Tahiti": "FR",
  "Australia/Sydney": "AU", "Pacific/Auckland": "NZ", "Asia/Tokyo": "JP",
  "Asia/Seoul": "KR", "Asia/Shanghai": "CN", "Asia/Kolkata": "IN",
  "America/Sao_Paulo": "BR", "America/Mexico_City": "MX",
  "America/Argentina/Buenos_Aires": "AR", "Africa/Johannesburg": "ZA",
  "Africa/Lagos": "NG", "Africa/Nairobi": "KE", "Asia/Bangkok": "TH",
  "Asia/Ho_Chi_Minh": "VN", "Asia/Manila": "PH", "Asia/Singapore": "SG",
  "Asia/Kuala_Lumpur": "MY", "Asia/Jakarta": "ID", "America/Bogota": "CO",
  "America/Santiago": "CL", "America/Lima": "PE", "America/Port-au-Prince": "HT",
  "Europe/Monaco": "MC", "Asia/Beirut": "LB", "Africa/Kinshasa": "CD",
};


/**
 * The country an IANA timezone belongs to, or null when it is not one we map.
 *
 * Pure and exported so the table can be tested without stubbing
 * `Intl.DateTimeFormat`, which is the only reason the US gaps went unnoticed.
 * Null rather than a guess: null is what lets `navigator.language` have its
 * turn, whereas a wrong country offers a visitor the wrong market confidently.
 */
export function countryForTimezone(
  timezone: string | null | undefined,
): CountryCode | null {
  if (!timezone) return null;
  return TZ_TO_COUNTRY[timezone] ?? null;
}
