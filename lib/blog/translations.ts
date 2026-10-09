import { localePath } from "@/lib/hreflang";
import { BLOG_LOCALES } from "./locales";

type BlogLocale = (typeof BLOG_LOCALES)[number];

/** Slugs of the same article in each language it is published in. */
export type PostCluster = Partial<Record<BlogLocale, string>>;

/**
 * Posts that are versions of the same article, one cluster per article.
 * Each cluster becomes the post's hreflang, in its page and in the sitemap.
 * A post listed nowhere has no translation and emits no hreflang.
 */
export const POST_TRANSLATIONS: readonly PostCluster[] = [
  { fr: "apple-wallet-carte-fidelite", en: "apple-wallet-loyalty-card" },
  { fr: "carte-fidelite-cafe", en: "coffee-shop-loyalty-card" },
  {
    fr: "carte-fidelite-dematerialisee",
    en: "how-to-create-digital-loyalty-card",
    es: "como-crear-tarjeta-fidelidad-digital",
  },
  { fr: "carte-fidelite-papier-vs-digitale", en: "paper-vs-digital-loyalty-card" },
  { fr: "carte-fidelite-points-wallet", en: "points-loyalty-card-wallet" },
  {
    fr: "carte-fidelite-sans-application",
    en: "loyalty-card-without-app",
    es: "tarjeta-fidelidad-sin-app",
  },
  { fr: "google-wallet-carte-fidelite", es: "google-wallet-tarjeta-fidelidad" },
  {
    fr: "guide-carte-fidelite-digitale",
    en: "digital-loyalty-card-small-business",
    es: "tarjeta-fidelidad-digital-pequeno-comercio",
  },
  { fr: "points-ou-tampons", en: "points-vs-stamps-loyalty" },
  { fr: "programme-fidelite-a-points", en: "points-based-loyalty-program" },
  { en: "best-loyalty-card-system-small-business", es: "mejor-app-fidelizacion-comercios" },
];

/** x-default prefers the English post, then the French one. */
const X_DEFAULT_ORDER: readonly BlogLocale[] = ["en", "fr", "es"];

function clusterOf(locale: string, slug: string): PostCluster | undefined {
  return POST_TRANSLATIONS.find(
    (cluster) => cluster[locale as BlogLocale] === slug
  );
}

/**
 * hreflang map for a blog post: one entry per language the article exists in,
 * plus `x-default`. Every post of a cluster returns the same map. Undefined
 * for a post with no translation.
 */
export function postLanguages(
  locale: string,
  slug: string,
  { baseUrl = "" }: { baseUrl?: string } = {}
): Record<string, string> | undefined {
  const cluster = clusterOf(locale, slug);
  if (!cluster) return undefined;

  const url = (l: BlogLocale) => `${baseUrl}${localePath(l, `/blog/${cluster[l]}`)}`;
  const present = BLOG_LOCALES.filter((l) => cluster[l]);
  const xDefault = X_DEFAULT_ORDER.find((l) => cluster[l]) ?? present[0];

  return {
    "x-default": url(xDefault),
    ...Object.fromEntries(present.map((l) => [l, url(l)])),
  };
}
