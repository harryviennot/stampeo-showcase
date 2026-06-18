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

// Map IANA timezones to Spanish-speaking countries/regions. Base `es` covers
// all of them (Spain + Latin America); the wallet/OS does the es-XX → es fallback.
const SPANISH_TIMEZONES = new Set([
  // Spain & islands
  "Europe/Madrid", "Atlantic/Canary", "Africa/Ceuta",
  // Mexico
  "America/Mexico_City", "America/Tijuana", "America/Monterrey",
  "America/Merida", "America/Cancun", "America/Chihuahua",
  // Central America & Caribbean
  "America/Guatemala", "America/El_Salvador", "America/Tegucigalpa",
  "America/Managua", "America/Costa_Rica", "America/Panama",
  "America/Havana", "America/Santo_Domingo",
  // South America
  "America/Bogota", "America/Lima", "America/Caracas", "America/Guayaquil",
  "America/La_Paz", "America/Santiago", "America/Asuncion",
  "America/Montevideo", "America/Argentina/Buenos_Aires",
]);

/**
 * Detect the business locale based on the user's timezone.
 * Falls back to the provided locale if timezone detection fails.
 */
export function detectBusinessLocale(fallbackLocale: string): "fr" | "en" | "es" {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && FRENCH_TIMEZONES.has(tz)) return "fr";
    // Check Canadian French timezone specifically
    if (tz?.startsWith("America/Montreal")) return "fr";
    if (tz && SPANISH_TIMEZONES.has(tz)) return "es";
  } catch {
    // Intl not available — fall back
  }
  if (fallbackLocale === "fr") return "fr";
  if (fallbackLocale === "es") return "es";
  return "en";
}
