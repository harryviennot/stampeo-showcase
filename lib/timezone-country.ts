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

const TZ_TO_COUNTRY: Record<string, CountryCode> = {
  "Europe/Paris": "FR", "Europe/London": "GB", "America/New_York": "US",
  "America/Chicago": "US", "America/Denver": "US", "America/Los_Angeles": "US",
  // The four above are Eastern/Central/Mountain/Pacific and cover most of the
  // country, but a browser reports the IANA zone the OS is set to, not the
  // canonical one for the region -- Arizona says America/Phoenix, Michigan says
  // America/Detroit. Missing them costs a US visitor the "see US pricing" offer
  // and leaves them reading EUR 20 for a plan they would be charged $49 for.
  "America/Phoenix": "US", "America/Anchorage": "US", "America/Detroit": "US",
  "America/Indiana/Indianapolis": "US", "America/Boise": "US",
  "America/Juneau": "US", "Pacific/Honolulu": "US",
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
