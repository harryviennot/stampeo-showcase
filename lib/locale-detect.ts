// Map IANA timezones to French-speaking countries/regions
const FRENCH_TIMEZONES = new Set([
  // France & territories
  "Europe/Paris",
  "Indian/Reunion", "Indian/Mayotte", "Pacific/Noumea", "Pacific/Tahiti",
  "America/Guadeloupe", "America/Martinique", "America/Cayenne",
  // Belgium, Luxembourg, Monaco, Switzerland (French-speaking cantons share timezone)
  "Europe/Brussels", "Europe/Luxembourg",
  // West & Central Africa (French-speaking)
  "Africa/Dakar", "Africa/Abidjan", "Africa/Bamako", "Africa/Ouagadougou",
  "Africa/Niamey", "Africa/Lome", "Africa/Porto-Novo", "Africa/Conakry",
  "Africa/Brazzaville", "Africa/Kinshasa", "Africa/Lubumbashi",
  "Africa/Douala", "Africa/Libreville", "Africa/Djibouti",
  "Indian/Comoro", "Indian/Antananarivo",
  // Haiti
  "America/Port-au-Prince",
]);

/**
 * Detect the business locale based on the user's timezone.
 * Falls back to the provided locale if timezone detection fails.
 */
export function detectBusinessLocale(fallbackLocale: string): "fr" | "en" {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && FRENCH_TIMEZONES.has(tz)) return "fr";
    // Check Canadian French timezone specifically
    if (tz?.startsWith("America/Montreal")) return "fr";
  } catch {
    // Intl not available — fall back
  }
  return fallbackLocale === "fr" ? "fr" : "en";
}
