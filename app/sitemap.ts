import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { BLOG_LOCALES } from "@/lib/blog/locales";
import { FEATURE_SLUGS, getLocalizedSlug } from "@/lib/feature-slugs";
import { LOYALTY_SLUGS } from "@/lib/loyalty-routes";
import { localeAlternates, localePath } from "@/lib/hreflang";
import { routing } from "@/i18n/routing";

const BASE_URL = "https://stampeo.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = routing.locales;

  type ChangeFreq = "weekly" | "monthly" | "yearly";
  const staticPages: Array<{
    path: string;
    /** Locale-specific paths, for pages whose slug differs per language. */
    paths?: Partial<Record<string, string>>;
    /** Locales that have no version of this page, so it stays out of their
     *  sitemap and out of everyone's hreflang cluster. */
    skipLocales?: string[];
    priority: number;
    changeFrequency: ChangeFreq;
  }> = [
    { path: "", priority: 1.0, changeFrequency: "weekly" },
    { path: "/pricing", priority: 0.9, changeFrequency: "monthly" },
    { path: LOYALTY_SLUGS.fr, paths: LOYALTY_SLUGS, priority: 0.9, changeFrequency: "monthly" },
    { path: "/changelog", priority: 0.6, changeFrequency: "weekly" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
    // /programme-fondateur + /founding-partner are gone from the sitemap: the
    // founding program closed and both routes now 307 to /pricing.
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  ];

  const entries: MetadataRoute.Sitemap = [];

  // Blog index — only the locales that actually have articles
  const blogLanguages = localeAlternates("/blog", {
    locales: BLOG_LOCALES,
    baseUrl: BASE_URL,
  });
  for (const locale of BLOG_LOCALES) {
    entries.push({
      url: `${BASE_URL}${localePath(locale, "/blog")}`,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: { languages: blogLanguages },
    });
  }

  // Static pages with i18n alternates (locale-specific slugs where they differ)
  for (const page of staticPages) {
    const pageLocales = locales.filter(
      (locale) => !page.skipLocales?.includes(locale)
    );
    const languages = localeAlternates(page.path, {
      overrides: page.paths,
      locales: pageLocales,
      baseUrl: BASE_URL,
    });

    for (const locale of pageLocales) {
      entries.push({
        url: `${BASE_URL}${localePath(locale, page.paths?.[locale] ?? page.path)}`,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: { languages },
      });
    }
  }

  // Feature pages with i18n alternates (locale-specific slugs)
  for (const frSlug of FEATURE_SLUGS) {
    const paths = Object.fromEntries(
      locales.map((locale) => [
        locale,
        `/features/${getLocalizedSlug(frSlug, locale)}`,
      ])
    );
    const languages = localeAlternates(`/features/${frSlug}`, {
      overrides: paths,
      baseUrl: BASE_URL,
    });

    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}${localePath(locale, paths[locale])}`,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: { languages },
      });
    }
  }

  // Blog posts — each locale has its own slugs
  for (const locale of BLOG_LOCALES) {
    for (const post of getAllPosts(locale)) {
      entries.push({
        url: `${BASE_URL}${localePath(locale, `/blog/${post.slug}`)}`,
        lastModified: post.updatedAt || post.publishedAt,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
