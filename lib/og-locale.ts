/** OpenGraph wants a language_TERRITORY tag, so each locale names a region. */
const OG_LOCALES: Record<string, string> = {
  fr: "fr_FR",
  en: "en_US",
  es: "es_ES",
  pl: "pl_PL",
};

export function ogLocale(locale: string): string {
  return OG_LOCALES[locale] ?? OG_LOCALES.en;
}
