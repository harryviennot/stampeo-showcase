import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { FEATURE_SLUGS, getLocalizedSlug } from "@/lib/feature-slugs";

const BASE_URL = "https://stampeo.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["fr", "en"];
  const now = new Date().toISOString();

  const staticPages = [
    { path: "", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/pricing", priority: 0.9, changeFrequency: "monthly" as const },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/programme-fondateur", enPath: "/founding-partner", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  const entries: MetadataRoute.Sitemap = [];

  // Blog index — both languages with alternates
  for (const locale of ["fr", "en"]) {
    const url =
      locale === "fr" ? `${BASE_URL}/blog` : `${BASE_URL}/${locale}/blog`;
    entries.push({
      url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: {
          "x-default": `${BASE_URL}/blog`,
          fr: `${BASE_URL}/blog`,
          en: `${BASE_URL}/en/blog`,
        },
      },
    });
  }

  // Static pages with i18n alternates
  for (const page of staticPages) {
    const enPath = page.enPath || page.path;
    for (const locale of locales) {
      const url =
        locale === "fr"
          ? `${BASE_URL}${page.path}`
          : `${BASE_URL}/${locale}${enPath}`;

      entries.push({
        url,
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: {
            "x-default": `${BASE_URL}${page.path}`,
            fr: `${BASE_URL}${page.path}`,
            en: `${BASE_URL}/en${enPath}`,
          },
        },
      });
    }
  }

  // Feature pages with i18n alternates (locale-specific slugs)
  for (const frSlug of FEATURE_SLUGS) {
    const enSlug = getLocalizedSlug(frSlug, "en");

    for (const locale of locales) {
      const url =
        locale === "fr"
          ? `${BASE_URL}/features/${frSlug}`
          : `${BASE_URL}/${locale}/features/${enSlug}`;

      entries.push({
        url,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: {
          languages: {
            "x-default": `${BASE_URL}/features/${frSlug}`,
            fr: `${BASE_URL}/features/${frSlug}`,
            en: `${BASE_URL}/en/features/${enSlug}`,
          },
        },
      });
    }
  }

  // Blog posts — French
  const frPosts = getAllPosts("fr");
  for (const post of frPosts) {
    entries.push({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updatedAt || post.publishedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  // Blog posts — English
  const enPosts = getAllPosts("en");
  for (const post of enPosts) {
    entries.push({
      url: `${BASE_URL}/en/blog/${post.slug}`,
      lastModified: post.updatedAt || post.publishedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
