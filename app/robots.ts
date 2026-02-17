import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/auth/", "/onboarding/", "/login/"],
      },
      // AI search engine bots — explicitly allowed for GEO visibility
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/api/", "/auth/", "/onboarding/", "/login/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
        disallow: ["/api/", "/auth/", "/onboarding/", "/login/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/api/", "/auth/", "/onboarding/", "/login/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/api/", "/auth/", "/onboarding/", "/login/"],
      },
      {
        userAgent: "anthropic-ai",
        allow: "/",
        disallow: ["/api/", "/auth/", "/onboarding/", "/login/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/auth/", "/onboarding/", "/login/"],
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/api/", "/auth/", "/onboarding/", "/login/"],
      },
    ],
    sitemap: "https://stampeo.app/sitemap.xml",
  };
}
