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

const USER_AGENTS = [
  "*",
  "GPTBot",
  "ChatGPT-User",
  "PerplexityBot",
  "ClaudeBot",
  "anthropic-ai",
  "Googlebot",
  "Bingbot",
];

const CONTENT_SIGNAL = "Content-Signal: ai-train=yes, search=yes, ai-input=yes";
const SITEMAP = "https://stampeo.app/sitemap.xml";

function buildBlock(userAgent: string): string {
  const lines = [
    `User-agent: ${userAgent}`,
    "Allow: /",
    ...DISALLOW_PATHS.map((path) => `Disallow: ${path}`),
    CONTENT_SIGNAL,
  ];
  return lines.join("\n");
}

export function GET(): Response {
  const body =
    USER_AGENTS.map(buildBlock).join("\n\n") + `\n\nSitemap: ${SITEMAP}\n`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
