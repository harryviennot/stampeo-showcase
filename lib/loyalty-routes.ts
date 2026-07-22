/**
 * Localized slugs for the loyalty-programs marketing page. Each locale has its
 * own native, SEO-friendly slug; the three route folders cross-redirect so
 * every locale resolves to one canonical URL. Mirrors the founding-partner
 * two-folder pattern, extended to three locales.
 */
export const LOYALTY_SLUGS = {
  fr: "/programme-fidelite",
  en: "/loyalty-programs",
  es: "/programa-de-fidelizacion",
} as const;

export type LoyaltyLocale = keyof typeof LOYALTY_SLUGS;

const isLoyaltyLocale = (locale: string): locale is LoyaltyLocale =>
  locale in LOYALTY_SLUGS;

/** Absolute path for a locale (fr is unprefixed, en/es are prefixed). */
export function loyaltyPath(locale: string): string {
  const l = isLoyaltyLocale(locale) ? locale : "fr";
  const slug = LOYALTY_SLUGS[l];
  return l === "fr" ? slug : `/${l}${slug}`;
}

/** hreflang alternates map (locale -> localized path, plus x-default = fr). */
export const LOYALTY_LANGUAGES: Record<string, string> = {
  "x-default": loyaltyPath("fr"),
  fr: loyaltyPath("fr"),
  en: loyaltyPath("en"),
  es: loyaltyPath("es"),
};
