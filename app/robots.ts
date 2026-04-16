import type { MetadataRoute } from "next";

const DISALLOW_PATHS = [
  "/api/",
  "/auth/",
  "/onboarding/",
  "/login/",
  "/en/onboarding/",
  "/en/login/",
  "/en/auth/",
  "/*opengraph-image*",
  "/favicon.ico",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW_PATHS,
      },
      // AI search engine bots — explicitly allowed for GEO visibility
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: DISALLOW_PATHS,
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: DISALLOW_PATHS,
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: DISALLOW_PATHS,
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: DISALLOW_PATHS,
      },
      {
        userAgent: "anthropic-ai",
        allow: "/",
        disallow: DISALLOW_PATHS,
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: DISALLOW_PATHS,
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: DISALLOW_PATHS,
      },
    ],
    sitemap: "https://stampeo.app/sitemap.xml",
  };
}
