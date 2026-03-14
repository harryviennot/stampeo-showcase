import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { FEATURE_SLUGS } from "@/lib/feature-slugs";

const BASE_URL = "https://stampeo.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["fr", "en"];
  const now = new Date().toISOString();

  const staticPages = [
    { path: "", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.6, changeFrequency: "monthly" as const },
    { path: "/programme-fondateur", priority: 0.8, changeFrequency: "monthly" as const },
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
    for (const locale of locales) {
      const url =
        locale === "fr"
          ? `${BASE_URL}${page.path}`
          : `${BASE_URL}/${locale}${page.path}`;

      entries.push({
        url,
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
        alternates: {
          languages: {
            "x-default": `${BASE_URL}${page.path}`,
            fr: `${BASE_URL}${page.path}`,
            en: `${BASE_URL}/en${page.path}`,
          },
        },
      });
    }
  }

  // Feature pages with i18n alternates
  for (const slug of FEATURE_SLUGS) {
    for (const locale of locales) {
      const url =
        locale === "fr"
          ? `${BASE_URL}/features/${slug}`
          : `${BASE_URL}/${locale}/features/${slug}`;

      entries.push({
        url,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
        alternates: {
          languages: {
            "x-default": `${BASE_URL}/features/${slug}`,
            fr: `${BASE_URL}/features/${slug}`,
            en: `${BASE_URL}/en/features/${slug}`,
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
