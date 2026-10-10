import { localePath } from "@/lib/hreflang";
import { getAllPosts } from "./index";
import { hasBlog } from "./locales";

const BASE_URL = "https://stampeo.app";

/** RSS channel title and description, per site locale. */
const CHANNELS: Record<string, { title: string; description: string }> = {
  fr: {
    title: "Blog Stampeo",
    description:
      "Conseils, guides et actualités sur les programmes de fidélité digitaux pour les commerces locaux.",
  },
  en: {
    title: "Stampeo Blog",
    description:
      "Insights, guides, and news about digital loyalty programs for local businesses.",
  },
  es: {
    title: "Stampeo Blog",
    description:
      "Ideas, guías y novedades sobre programas de fidelidad digitales para comercios locales.",
  },
  pl: {
    title: "Stampeo Blog",
    description:
      "Porady, poradniki i nowości o cyfrowych programach lojalnościowych dla lokalnych firm.",
  },
};

/** Path of a locale's RSS feed. */
export function feedPath(locale: string): string {
  return `/feed-${locale}.xml`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * The RSS feed of a locale's blog, or a 404 for a locale with no blog
 * (an empty channel would advertise a blog that has nothing in it).
 */
export function blogFeedResponse(locale: string): Response {
  const channel = CHANNELS[locale];
  if (!hasBlog(locale) || !channel) {
    return new Response("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const items = getAllPosts(locale)
    .map((post) => {
      const url = `${BASE_URL}${localePath(locale, `/blog/${post.slug}`)}`;
      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <guid>${url}</guid>
      ${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("\n      ")}
    </item>`;
    })
    .join("");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${channel.title}</title>
    <link>${BASE_URL}${localePath(locale, "/blog")}</link>
    <description>${channel.description}</description>
    <language>${locale}</language>
    <atom:link href="${BASE_URL}${feedPath(locale)}" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
