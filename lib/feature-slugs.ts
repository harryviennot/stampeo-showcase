export const FEATURES = {
  "design-de-carte": {
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  },
  "scanner-mobile": {
    icon: "M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zM7 4V3h10v1H7zm0 2h10v12H7V6zm0 14h10v1H7v-1z",
  },
  "notifications-push": {
    icon: "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z",
  },
  analytiques: {
    icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z",
  },
  geolocalisation: {
    icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  },
  "campagnes-promotionnelles": {
    icon: "M3 11v2c0 1.1.9 2 2 2h1l3 4h2V5H9L6 9H5c-1.1 0-2 .9-2 2zm13.5 1c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z",
  },
} as const;

export type FeatureSlug = keyof typeof FEATURES;

/** FR slug → EN slug */
const FR_TO_EN: Record<FeatureSlug, string> = {
  "design-de-carte": "card-design",
  "scanner-mobile": "mobile-scanner",
  "notifications-push": "push-notifications",
  analytiques: "analytics",
  geolocalisation: "geolocation",
  "campagnes-promotionnelles": "promotional-campaigns",
};

/** EN slug → FR slug */
const EN_TO_FR: Record<string, FeatureSlug> = Object.fromEntries(
  Object.entries(FR_TO_EN).map(([fr, en]) => [en, fr as FeatureSlug])
) as Record<string, FeatureSlug>;

/** Get the locale-appropriate slug for a feature */
export function getLocalizedSlug(frSlug: FeatureSlug, locale: string): string {
  return locale === "en" ? FR_TO_EN[frSlug] : frSlug;
}

/** Resolve any slug (FR or EN) to its canonical FR slug, or null if invalid */
export function resolveToCanonicalSlug(slug: string): FeatureSlug | null {
  if (slug in FEATURES) return slug as FeatureSlug;
  if (slug in EN_TO_FR) return EN_TO_FR[slug];
  return null;
}

/** Check if a slug is the correct one for the given locale */
export function isCorrectSlugForLocale(
  slug: string,
  locale: string
): boolean {
  const canonical = resolveToCanonicalSlug(slug);
  if (!canonical) return false;
  const expected = getLocalizedSlug(canonical, locale);
  return slug === expected;
}

export function isValidSlug(slug: string): slug is FeatureSlug {
  return slug in FEATURES;
}

export const FEATURE_SLUGS = Object.keys(FEATURES) as FeatureSlug[];

export function generateFeatureStaticParams() {
  // Generate both FR and EN slugs so all URLs are statically available
  const frSlugs = FEATURE_SLUGS.map((slug) => ({ slug }));
  const enSlugs = FEATURE_SLUGS.map((slug) => ({ slug: FR_TO_EN[slug] }));
  return [...frSlugs, ...enSlugs];
}
