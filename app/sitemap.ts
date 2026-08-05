import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { FEATURE_SLUGS, getLocalizedSlug } from "@/lib/feature-slugs";
import { routing } from "@/i18n/routing";

const BASE_URL = "https://stampeo.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = routing.locales; // ["fr", "en", "es"]

  type ChangeFreq = "weekly" | "monthly" | "yearly";
  const staticPages: Array<{
    path: string;
    enPath?: string;
    esPath?: string;
    /** True for pages that have no Spanish version (e.g. founding partner). */
    noEs?: boolean;
    priority: number;
    changeFrequency: ChangeFreq;
  }> = [
    { path: "", priority: 1.0, changeFrequency: "weekly" },
    { path: "/pricing", priority: 0.9, changeFrequency: "monthly" },
    { path: "/programme-fidelite", enPath: "/loyalty-programs", esPath: "/programa-de-fidelizacion", priority: 0.9, changeFrequency: "monthly" },
    { path: "/changelog", priority: 0.6, changeFrequency: "weekly" },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
    // /programme-fondateur + /founding-partner are gone from the sitemap: the
    // founding program closed and both routes now 307 to /pricing.
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  ];

  const entries: MetadataRoute.Sitemap = [];

  // Blog index — every locale with alternates
  const blogLanguages = {
    "x-default": `${BASE_URL}/blog`,
    fr: `${BASE_URL}/blog`,
    en: `${BASE_URL}/en/blog`,
    es: `${BASE_URL}/es/blog`,
  };
  for (const locale of locales) {
    const url =
      locale === "fr" ? `${BASE_URL}/blog` : `${BASE_URL}/${locale}/blog`;
    entries.push({
      url,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: { languages: blogLanguages },
    });
  }

  // Static pages with i18n alternates (locale-specific slugs where they differ)
  for (const page of staticPages) {
    const enPath = page.enPath ?? page.path;
    const esPath = page.esPath ?? page.path;

    const languages: Record<string, string> = {
      "x-default": `${BASE_URL}${page.path}`,
      fr: `${BASE_URL}${page.path}`,
      en: `${BASE_URL}/en${enPath}`,
    };
    if (!page.noEs) languages.es = `${BASE_URL}/es${esPath}`;

    for (const locale of locales) {
      if (locale === "es" && page.noEs) continue;
      const localizedPath =
        locale === "en" ? enPath : locale === "es" ? esPath : page.path;
      const url =
        locale === "fr"
          ? `${BASE_URL}${page.path}`
          : `${BASE_URL}/${locale}${localizedPath}`;

      entries.push({
        url,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: { languages },
      });
    }
  }

  // Feature pages with i18n alternates (locale-specific slugs)
  for (const frSlug of FEATURE_SLUGS) {
    const enSlug = getLocalizedSlug(frSlug, "en");
    const esSlug = getLocalizedSlug(frSlug, "es");

    const languages = {
      "x-default": `${BASE_URL}/features/${frSlug}`,
      fr: `${BASE_URL}/features/${frSlug}`,
      en: `${BASE_URL}/en/features/${enSlug}`,
      es: `${BASE_URL}/es/features/${esSlug}`,
    };

    for (const locale of locales) {
      const slug =
        locale === "en" ? enSlug : locale === "es" ? esSlug : frSlug;
      const url =
        locale === "fr"
          ? `${BASE_URL}/features/${frSlug}`
          : `${BASE_URL}/${locale}/features/${slug}`;

      entries.push({
        url,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: { languages },
      });
    }
  }

  // Blog posts — each locale has its own slugs
  for (const locale of locales) {
    const prefix = locale === "fr" ? "" : `/${locale}`;
    for (const post of getAllPosts(locale)) {
      entries.push({
        url: `${BASE_URL}${prefix}/blog/${post.slug}`,
        lastModified: post.updatedAt || post.publishedAt,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
