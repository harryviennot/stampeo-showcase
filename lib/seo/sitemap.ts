import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getAllPosts } from "@/lib/blog";
import { BLOG_LOCALES } from "@/lib/blog/locales";
import { postLanguages } from "@/lib/blog/translations";
import { FEATURE_SLUGS, getLocalizedSlug } from "@/lib/feature-slugs";
import { localeAlternates, localePath, marketAlternates } from "@/lib/hreflang";
import { LOYALTY_SLUGS } from "@/lib/loyalty-routes";
import { MARKETS, indexablePilotPaths, marketFromPath } from "@/lib/markets";

export const SITEMAP_BASE_URL = "https://stampeo.app";

type ChangeFreq = "weekly" | "monthly" | "yearly";

interface StaticPage {
  path: string;
  /** Locale-specific paths, for pages whose slug differs per language. */
  paths?: Partial<Record<string, string>>;
  /** Locales that have no version of this page, so it stays out of their
   *  sitemap and out of everyone's hreflang cluster. */
  skipLocales?: string[];
  /** The page also exists inside the country pilots (/us, /us/pricing), so
   *  its cluster lists their versions too. */
  inMarkets?: boolean;
  priority: number;
  changeFrequency: ChangeFreq;
}

/** Pages served in every locale. The blog, features and pilots are added below. */
export const STATIC_PAGES: readonly StaticPage[] = [
  { path: "/", inMarkets: true, priority: 1.0, changeFrequency: "weekly" },
  { path: "/pricing", inMarkets: true, priority: 0.9, changeFrequency: "monthly" },
  { path: LOYALTY_SLUGS.fr, paths: LOYALTY_SLUGS, priority: 0.9, changeFrequency: "monthly" },
  { path: "/changelog", priority: 0.6, changeFrequency: "weekly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
];

const absolute = (path: string) => `${SITEMAP_BASE_URL}${path}`;

/**
 * Every indexable page, each with the hreflang cluster of its own page.
 * Only blog posts carry `lastModified`: it is the one date that is real.
 */
export function buildSitemap(): MetadataRoute.Sitemap {
  const locales = routing.locales;
  const baseUrl = SITEMAP_BASE_URL;
  const entries: MetadataRoute.Sitemap = [];

  // Blog index, only in the locales that have articles.
  const blogLanguages = localeAlternates("/blog", { locales: BLOG_LOCALES, baseUrl });
  for (const locale of BLOG_LOCALES) {
    entries.push({
      url: absolute(localePath(locale, "/blog")),
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: { languages: blogLanguages },
    });
  }

  for (const page of STATIC_PAGES) {
    const pageLocales = locales.filter((locale) => !page.skipLocales?.includes(locale));
    const languages = page.inMarkets
      ? marketAlternates(page.path, { baseUrl })
      : localeAlternates(page.path, { overrides: page.paths, locales: pageLocales, baseUrl });

    for (const locale of pageLocales) {
      entries.push({
        url: absolute(localePath(locale, page.paths?.[locale] ?? page.path)),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: { languages },
      });
    }
  }

  // Feature pages, with locale-specific slugs.
  for (const frSlug of FEATURE_SLUGS) {
    const paths = Object.fromEntries(
      locales.map((locale) => [locale, `/features/${getLocalizedSlug(frSlug, locale)}`])
    );
    const languages = localeAlternates(`/features/${frSlug}`, { overrides: paths, baseUrl });

    for (const locale of locales) {
      entries.push({
        url: absolute(localePath(locale, paths[locale])),
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: { languages },
      });
    }
  }

  // Country pilots are markets, not locales, so the loops above never reach
  // them. Each carries the cluster of the page it is the market version of.
  for (const path of indexablePilotPaths()) {
    const market = marketFromPath(path);
    const pagePath = (market && path.slice(MARKETS[market].path.length)) || "/";
    entries.push({
      url: absolute(path),
      changeFrequency: "monthly",
      priority: pagePath === "/" ? 1.0 : 0.9,
      alternates: { languages: marketAlternates(pagePath, { baseUrl }) },
    });
  }

  // Blog posts; a translated post carries its translation cluster.
  for (const locale of BLOG_LOCALES) {
    for (const post of getAllPosts(locale)) {
      const languages = postLanguages(locale, post.slug, { baseUrl });
      entries.push({
        url: absolute(localePath(locale, `/blog/${post.slug}`)),
        lastModified: post.updatedAt || post.publishedAt,
        changeFrequency: "monthly",
        priority: 0.6,
        ...(languages && { alternates: { languages } }),
      });
    }
  }

  return entries;
}
