import {
  type CountryCode,
  getCountries,
  getCountryCallingCode,
  parsePhoneNumber,
  isValidPhoneNumber,
  AsYouType,
  getExampleNumber,
  type Examples,
} from "libphonenumber-js";
import examples from "libphonenumber-js/mobile/examples";

/** Country entry for the dropdown */
export interface CountryEntry {
  code: CountryCode;
  name: string;
  dialCode: string;
  flag: string;
}

/** Convert a country code to a flag emoji (e.g., "FR" → "🇫🇷") */
function countryToFlag(code: string): string {
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

/** Country names in English and French */
const COUNTRY_NAMES_EN: Partial<Record<CountryCode, string>> = {
  FR: "France", US: "United States", GB: "United Kingdom", DE: "Germany",
  ES: "Spain", IT: "Italy", PT: "Portugal", BE: "Belgium", CH: "Switzerland",
  CA: "Canada", NL: "Netherlands", AT: "Austria", IE: "Ireland", LU: "Luxembourg",
  AU: "Australia", NZ: "New Zealand", JP: "Japan", KR: "South Korea",
  CN: "China", IN: "India", BR: "Brazil", MX: "Mexico", AR: "Argentina",
  SE: "Sweden", NO: "Norway", DK: "Denmark", FI: "Finland", PL: "Poland",
  CZ: "Czech Republic", RO: "Romania", HU: "Hungary", GR: "Greece",
  TR: "Turkey", RU: "Russia", UA: "Ukraine", IL: "Israel", AE: "UAE",
  SA: "Saudi Arabia", MA: "Morocco", TN: "Tunisia", DZ: "Algeria",
  SN: "Senegal", CI: "Côte d'Ivoire", CM: "Cameroon", MG: "Madagascar",
  MU: "Mauritius", RE: "Réunion", GP: "Guadeloupe", MQ: "Martinique",
  GF: "French Guiana", NC: "New Caledonia", PF: "French Polynesia",
  ZA: "South Africa", NG: "Nigeria", GH: "Ghana", KE: "Kenya",
  TH: "Thailand", VN: "Vietnam", PH: "Philippines", SG: "Singapore",
  MY: "Malaysia", ID: "Indonesia", CO: "Colombia", CL: "Chile", PE: "Peru",
  HT: "Haiti", MC: "Monaco", LB: "Lebanon", CD: "DR Congo",
};

const COUNTRY_NAMES_FR: Partial<Record<CountryCode, string>> = {
  FR: "France", US: "États-Unis", GB: "Royaume-Uni", DE: "Allemagne",
  ES: "Espagne", IT: "Italie", PT: "Portugal", BE: "Belgique", CH: "Suisse",
  CA: "Canada", NL: "Pays-Bas", AT: "Autriche", IE: "Irlande", LU: "Luxembourg",
  AU: "Australie", NZ: "Nouvelle-Zélande", JP: "Japon", KR: "Corée du Sud",
  CN: "Chine", IN: "Inde", BR: "Brésil", MX: "Mexique", AR: "Argentine",
  SE: "Suède", NO: "Norvège", DK: "Danemark", FI: "Finlande", PL: "Pologne",
  CZ: "Tchéquie", RO: "Roumanie", HU: "Hongrie", GR: "Grèce",
  TR: "Turquie", RU: "Russie", UA: "Ukraine", IL: "Israël", AE: "EAU",
  SA: "Arabie Saoudite", MA: "Maroc", TN: "Tunisie", DZ: "Algérie",
  SN: "Sénégal", CI: "Côte d'Ivoire", CM: "Cameroun", MG: "Madagascar",
  MU: "Maurice", RE: "La Réunion", GP: "Guadeloupe", MQ: "Martinique",
  GF: "Guyane française", NC: "Nouvelle-Calédonie", PF: "Polynésie française",
  ZA: "Afrique du Sud", NG: "Nigéria", GH: "Ghana", KE: "Kenya",
  TH: "Thaïlande", VN: "Viêt Nam", PH: "Philippines", SG: "Singapour",
  MY: "Malaisie", ID: "Indonésie", CO: "Colombie", CL: "Chili", PE: "Pérou",
  HT: "Haïti", MC: "Monaco", LB: "Liban", CD: "RD Congo",
};

/** Priority countries shown at the top of the dropdown */
const PRIORITY_COUNTRIES: CountryCode[] = [
  "FR", "BE", "CH", "CA", "US", "GB", "DE", "ES", "IT", "PT", "NL",
  "MA", "TN", "DZ", "SN", "CI", "CM",
];

let cachedList: CountryEntry[] | null = null;

/** Get the full list of countries with dial codes and flags */
export function getCountryList(locale: string = "en"): CountryEntry[] {
  if (cachedList) return cachedList;

  const names = locale === "fr" ? COUNTRY_NAMES_FR : COUNTRY_NAMES_EN;
  const allCountries = getCountries();

  const entries: CountryEntry[] = allCountries
    .map((code) => ({
      code,
      name: names[code] || code,
      dialCode: `+${getCountryCallingCode(code)}`,
      flag: countryToFlag(code),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Move priority countries to the top
  const priority = PRIORITY_COUNTRIES
    .map((code) => entries.find((e) => e.code === code))
    .filter(Boolean) as CountryEntry[];
  const rest = entries.filter((e) => !PRIORITY_COUNTRIES.includes(e.code));

  cachedList = [...priority, ...rest];
  return cachedList;
}

/** Map of timezone → country code for auto-detection */
const TZ_TO_COUNTRY: Record<string, CountryCode> = {
  "Europe/Paris": "FR", "Europe/London": "GB", "America/New_York": "US",
  "America/Chicago": "US", "America/Denver": "US", "America/Los_Angeles": "US",
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
 * Detect the default country from the browser environment.
 * Uses timezone first, then navigator.language, falls back to locale.
 */
export function detectDefaultCountry(locale: string): CountryCode {
  if (typeof window !== "undefined") {
    // Try timezone
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz && TZ_TO_COUNTRY[tz]) return TZ_TO_COUNTRY[tz];
    } catch {}

    // Try navigator.language (e.g., "fr-FR" → "FR", "en-GB" → "GB")
    try {
      const lang = navigator.language;
      if (lang.includes("-")) {
        const region = lang.split("-")[1].toUpperCase() as CountryCode;
        if (getCountries().includes(region)) return region;
      }
    } catch {}
  }

  // Fallback: map locale to most common country
  const localeMap: Record<string, CountryCode> = {
    fr: "FR", en: "US", de: "DE", es: "ES", it: "IT", pt: "PT", nl: "NL",
  };
  return localeMap[locale] || "FR";
}

/** Format a phone number to E.164 (e.g., "+33612345678"). Returns null if invalid. */
export function formatToE164(phone: string, country: CountryCode): string | null {
  try {
    const parsed = parsePhoneNumber(phone, country);
    if (parsed && parsed.isValid()) return parsed.format("E.164");
    return null;
  } catch {
    return null;
  }
}

/** Check if a phone number is valid for a given country */
export function isValidPhone(phone: string, country: CountryCode): boolean {
  try {
    return isValidPhoneNumber(phone, country);
  } catch {
    return false;
  }
}

/** Format as the user types */
export function formatAsYouType(input: string, country: CountryCode): string {
  const formatter = new AsYouType(country);
  return formatter.input(input);
}

/** Get an example phone number for a country (national format) */
export function getExamplePhoneNumber(country: CountryCode): string {
  try {
    const example = getExampleNumber(country, examples as Examples);
    if (example) return example.formatNational();
  } catch {}
  return "";
}
