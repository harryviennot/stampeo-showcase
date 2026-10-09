import { describe, expect, test } from "bun:test";

import {
  alternateProblems,
  articleImageUrls,
  breadcrumbProblems,
  canonicalProblems,
  feedLinkProblems,
  fontPreloadProblems,
  hiddenHeaderLinkProblems,
  imageResponseProblems,
  indexNowKeyProblems,
  indexablePageProblems,
  jsonLdProblems,
  linkProblems,
  offerProblems,
  openGraphProblems,
  priceProblems,
  privatePageProblems,
  redirectProblems,
  sitemapPaths,
  statusProblems,
  textProblems,
  titleProblems,
} from "./checks";
import { page, PRICING_HEAD } from "./fixtures";

describe("jsonLdProblems", () => {
  test("passes a page whose structured data is in the server HTML", () => {
    const html = page({ body: '<script type="application/ld+json">{"@type":"Organization"}</script>' });

    expect(jsonLdProblems(html)).toEqual([]);
  });

  test("fails a page whose structured data only exists in the flight payload (client-injected)", () => {
    expect(jsonLdProblems(page({ body: "<main>Pricing</main>" }))).toEqual([
      "no <script type=\"application/ld+json\"> in the raw HTML",
    ]);
  });

  test("fails a page with an unparseable block", () => {
    const html = page({
      body: '<script type="application/ld+json">{"@type":"Organization"}</script><script type="application/ld+json">{oops}</script>',
    });

    expect(jsonLdProblems(html)).toHaveLength(1);
    expect(jsonLdProblems(html)[0]).toStartWith("ld+json block 2 is not valid JSON");
  });
});

describe("priceProblems", () => {
  const EUR_LADDER =
    '<h3>Starter</h3><p><span>20<!-- --> €</span><span>/mois</span></p><h3>Growth</h3><p><span>40 €</span><span>/mois</span></p><h3>Pro</h3><p><span>80 €</span><span>/mois</span></p>';
  const USD_LADDER =
    '<h3>Starter</h3><p><span>$<!-- -->49</span><span>/mo</span></p><h3>Growth</h3><p><span>$79</span><span>/mo</span></p><h3>Pro</h3><p><span>$129</span><span>/mo</span></p><p>Start your <span>14</span>-day free trial</p>';

  test("passes server-rendered prices in the page's currency", () => {
    expect(priceProblems(page({ body: EUR_LADDER }), { currency: "€" })).toEqual([]);
    expect(priceProblems(page({ body: USD_LADDER }), { currency: "$", trialDays: 14 })).toEqual([]);
  });

  test("fails a price skeleton left in front of the per-month suffix", () => {
    const skeleton =
      '<h3>Starter</h3><p><span class="animate-pulse rounded bg-muted h-8 w-16"></span><span>/month</span></p><p>$49/month</p><p>$79/month</p><p>$129/month</p>';

    const problems = priceProblems(page({ body: skeleton }), { currency: "$" });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('empty price before "/month"');
  });

  test("fails a page whose only price is one stray amount, written two ways", () => {
    const stray = "<main><p>A coffee at 3 €</p><p>€3</p></main>";

    expect(priceProblems(page({ body: stray }), { currency: "€" })).toEqual([
      "1 distinct € amount(s) (€3), expected at least 3",
    ]);
  });

  test.each([
    ["French", "Essai gratuit de 30 jours · Sans engagement"],
    ["English with a hyphen", "Every plan includes a 30-day free trial"],
    ["English with a space", "30 days free to try it"],
  ])("finds a 30-day trial written in %s", (_language, sentence) => {
    expect(priceProblems(page({ body: `${EUR_LADDER}\n<p>${sentence}</p>` }), { currency: "€", trialDays: 30 })).toEqual([]);
  });

  test("fails a euro page that never states the trial", () => {
    expect(priceProblems(page({ body: EUR_LADDER }), { currency: "€", trialDays: 30 })).toEqual([
      "no 30-day trial in the raw HTML",
    ]);
  });

  test("fails a US page that renders euros", () => {
    const problems = priceProblems(page({ body: EUR_LADDER }), { currency: "$" });

    expect(problems).toContain("no $ amount next to digits");
  });

  test("fails a US page that does not state the 14-day trial", () => {
    const thirtyDays = USD_LADDER.replace("<span>14</span>", "<span>30</span>");

    expect(priceProblems(page({ body: thirtyDays }), { currency: "$", trialDays: 14 })).toEqual([
      "no 14-day trial in the raw HTML",
    ]);
  });

  test("ignores prices that only exist inside scripts", () => {
    const scriptOnly = '<main>Pricing</main><script>window.__p = "$49/mo, 14-day trial"</script>';

    expect(priceProblems(page({ body: scriptOnly }), { currency: "$", trialDays: 14 })).toEqual([
      "no $ amount next to digits",
      "no 14-day trial in the raw HTML",
    ]);
  });
});

describe("titleProblems", () => {
  test.each([
    ["Tarifs Stampeo : la carte de fidélité dès 20 €", []],
    ["Pricing — Compare Plans | Stampeo | Stampeo", ['"Stampeo" appears 2 times']],
    [`${"x".repeat(51)} | Stampeo`, ["61 characters (max 60)"]],
    [null, ["no <title>"]],
  ])("%p → %p", (title, expected) => {
    expect(titleProblems(title)).toEqual(expected);
  });
});

describe("canonicalProblems", () => {
  test("passes a self-canonical page, comparing paths across hosts", () => {
    const html = page({ head: '<link rel="canonical" href="https://stampeo.app/en"/>' });

    expect(canonicalProblems(html, "/en")).toEqual([]);
  });

  test("passes the homepage, whose canonical has no trailing slash", () => {
    const html = page({ head: '<link rel="canonical" href="https://stampeo.app"/>' });

    expect(canonicalProblems(html, "/")).toEqual([]);
  });

  test("fails a page that inherits the homepage canonical", () => {
    const html = page({ head: '<link rel="canonical" href="https://stampeo.app"/>' });

    expect(canonicalProblems(html, "/us/pricing")).toEqual([
      'canonical is "/", expected "/us/pricing"',
    ]);
  });

  test("fails a page without a canonical", () => {
    expect(canonicalProblems(page({}), "/pricing")).toEqual(["no canonical link"]);
  });
});

describe("alternateProblems", () => {
  const html = page({ head: PRICING_HEAD });

  test("passes when every expected hreflang points at the expected path", () => {
    expect(
      alternateProblems(html, { "en-us": "/us/pricing", "x-default": "/en/pricing" }),
    ).toEqual([]);
  });

  test("fails a missing language and a wrong x-default", () => {
    expect(
      alternateProblems(html, { es: "/es/pricing", "x-default": "/pricing" }),
    ).toEqual([
      'no hreflang="es"',
      'hreflang="x-default" is "/en/pricing", expected "/pricing"',
    ]);
  });
});

describe("redirectProblems", () => {
  const response = (status: number, location?: string) => ({
    status,
    headers: new Headers(location ? { location } : {}),
  });

  test("passes a single permanent redirect with a relative Location", () => {
    expect(redirectProblems(response(308, "/us/pricing"), { status: 308, to: "/us/pricing" })).toEqual([]);
  });

  test("passes an absolute Location on another host by comparing paths", () => {
    expect(
      redirectProblems(response(307, "http://localhost:3000/en"), { status: 307, to: "/en" }),
    ).toEqual([]);
  });

  test("fails a temporary redirect where a permanent one is expected", () => {
    expect(redirectProblems(response(307, "/pricing"), { status: 308, to: "/pricing" })).toEqual([
      "HTTP 307, expected 308",
    ]);
  });

  test("fails a redirect to the wrong place, or none at all", () => {
    expect(
      redirectProblems(response(308, "/en/blog/carte-fidelite-cafe"), {
        status: 308,
        to: "/blog/carte-fidelite-cafe",
      }),
    ).toEqual(['Location is "/en/blog/carte-fidelite-cafe", expected "/blog/carte-fidelite-cafe"']);
    expect(redirectProblems(response(200), { status: 308, to: "/pricing" })).toEqual([
      "HTTP 200, expected 308",
      "no Location header",
    ]);
  });
});

const robotsHead = (content: string) => `<meta name="robots" content="${content}"/>`;
const canonicalHead = (url: string) => `<link rel="canonical" href="${url}"/>`;

describe("indexablePageProblems", () => {
  test("passes a page that is its own canonical and carries no noindex", () => {
    const html = page({ head: `${canonicalHead("https://stampeo.app/en/pricing")}${robotsHead("index, follow")}` });

    expect(indexablePageProblems(html, "/en/pricing")).toEqual([]);
  });

  test("fails a sitemap page that points at another canonical and is noindex", () => {
    const html = page({ head: `${canonicalHead("https://stampeo.app")}${robotsHead("noindex, follow")}` });

    expect(indexablePageProblems(html, "/en/pricing")).toEqual([
      'canonical is "/", expected "/en/pricing"',
      'robots meta is "noindex, follow"',
    ]);
  });
});

describe("privatePageProblems", () => {
  test("passes a noindex page with no canonical", () => {
    expect(privatePageProblems(page({ head: robotsHead("noindex, nofollow") }))).toEqual([]);
  });

  test("fails a private page that is indexable and inherits the homepage canonical", () => {
    const html = page({ head: canonicalHead("https://stampeo.app") });

    expect(privatePageProblems(html)).toEqual([
      "robots meta is missing, expected noindex",
      'declares canonical "https://stampeo.app"',
    ]);
  });
});

describe("statusProblems", () => {
  test("passes the expected status and fails any other", () => {
    expect(statusProblems(404, 404)).toEqual([]);
    expect(statusProblems(200, 404)).toEqual(["HTTP 200, expected 404"]);
  });
});

describe("sitemapPaths", () => {
  test("maps every <loc> to its path on any host", () => {
    const xml =
      "<urlset><url><loc>https://stampeo.app/</loc></url><url><loc>https://stampeo.app/en/blog/a-post</loc></url></urlset>";

    expect(sitemapPaths(xml)).toEqual(["/", "/en/blog/a-post"]);
  });
});

describe("linkProblems", () => {
  const html = page({ body: '<nav><a href="/us/pricing">Pricing</a><a href="/en">Home</a></nav>' });

  test("passes when the wanted links are there and the unwanted one is not", () => {
    expect(linkProblems(html, { has: ["/us/pricing"], lacks: ["/en/us/pricing"] })).toEqual([]);
  });

  test("fails a US page that links the redirecting /en/us/pricing, and one missing its pricing link", () => {
    const wrong = page({ body: '<a href="/en/us/pricing">Pricing</a>' });

    expect(linkProblems(wrong, { has: ["/us/pricing"], lacks: ["/en/us/pricing"] })).toEqual([
      "no link to /us/pricing",
      "links to /en/us/pricing",
    ]);
  });

  test("a trailing slash is a different link: /en/ redirects to /en", () => {
    expect(linkProblems(page({ body: '<a href="/en/">Home</a>' }), { has: ["/en"] })).toEqual(["no link to /en"]);
  });

  test("finds links whose class names hold a > character", () => {
    const tailwind = page({ body: '<a class="[&>svg]:size-4 text-sm" href="/en/contact">Contact</a>' });

    expect(linkProblems(tailwind, { has: ["/en/contact"] })).toEqual([]);
  });
});

describe("textProblems", () => {
  const html = page({ body: "<main><p>Reward <b>$10</b> off</p><p>14 min read</p><script>var x = '€'</script></main>" });

  test("passes when the wanted text is visible and the unwanted text is not, ignoring scripts", () => {
    expect(textProblems(html, { includes: [/\$\s?10\b/, /\d+ min read/], excludes: [/€/, /Mis à jour/] })).toEqual([]);
  });

  test("fails French text on an English post and a euro on a US page", () => {
    const french = page({ body: "<p>12 février 2026 · Mis à jour le 14 mars 2026 · 11 min de lecture</p><p>-10 €</p>" });

    expect(textProblems(french, { includes: [/min read/], excludes: [/Mis à jour/, /€/] })).toEqual([
      `no text matching ${/min read/}`,
      `text matches ${/Mis à jour/}: "Mis à jour"`,
      `text matches ${/€/}: "€"`,
    ]);
  });
});

describe("articleImageUrls and imageResponseProblems", () => {
  const article = (image: unknown) =>
    page({ body: `<script type="application/ld+json">${JSON.stringify({ "@type": "Article", image })}</script>` });

  test.each([
    ["a single URL", "https://stampeo.app/en/blog/a-post/opengraph-image", ["https://stampeo.app/en/blog/a-post/opengraph-image"]],
    ["a list with the cover", ["https://stampeo.app/a/opengraph-image", "https://stampeo.app/cover.png"], ["https://stampeo.app/a/opengraph-image", "https://stampeo.app/cover.png"]],
    ["no image", undefined, []],
  ])("reads %s", (_case, image, expected) => {
    expect(articleImageUrls(article(image))).toEqual(expected);
  });

  test("a 200 image passes; a 404 or an HTML answer fails", () => {
    expect(imageResponseProblems({ status: 200, contentType: "image/png" })).toEqual([]);
    expect(imageResponseProblems({ status: 404, contentType: "text/html; charset=utf-8" })).toEqual([
      "HTTP 404, expected 200",
      'content-type "text/html; charset=utf-8", expected image/*',
    ]);
  });
});

describe("offerProblems", () => {
  const application = (extra: Record<string, unknown>) =>
    page({ body: `<script type="application/ld+json">${JSON.stringify({ "@type": "SoftwareApplication", ...extra })}</script>` });

  test("passes offers in the market's currency, and passes a page with none (the fallback ladder)", () => {
    const offers = [{ "@type": "Offer", name: "Starter", priceCurrency: "USD" }];

    expect(offerProblems(application({ offers }), "USD")).toEqual([]);
    expect(offerProblems(application({}), "USD")).toEqual([]);
  });

  test("fails euro offers on a dollar page", () => {
    const offers = [{ "@type": "Offer", name: "Starter", priceCurrency: "EUR" }, { "@type": "Offer", name: "Pro", priceCurrency: "USD" }];

    expect(offerProblems(application({ offers }), "USD")).toEqual(['offer "Starter" is in EUR, expected USD']);
  });

  test("fails a pricing page with no SoftwareApplication at all", () => {
    expect(offerProblems(page({ body: "<main/>" }), "EUR")).toEqual(["no SoftwareApplication structured data"]);
  });
});

describe("feedLinkProblems", () => {
  const rss = '<link rel="alternate" type="application/rss+xml" href="https://stampeo.app/feed-fr.xml"/>';

  test("passes a page that advertises its locale's feed", () => {
    expect(feedLinkProblems(page({ head: PRICING_HEAD }), "/feed-fr.xml")).toEqual([]);
    expect(feedLinkProblems(page({ head: rss }))).toEqual([]);
  });

  test("fails a page with no feed link, and one that advertises another locale's feed", () => {
    expect(feedLinkProblems(page({ head: '<link rel="alternate" hrefLang="fr" href="https://stampeo.app"/>' }))).toEqual([
      'no <link rel="alternate" type="application/rss+xml">',
    ]);
    expect(feedLinkProblems(page({ head: rss }), "/feed-en.xml")).toEqual(["feed link is /feed-fr.xml, expected /feed-en.xml"]);
  });
});

describe("openGraphProblems", () => {
  const og = (...pairs: Array<[string, string]>) =>
    page({ head: pairs.map(([property, content]) => `<meta property="${property}" content="${content}"/>`).join("") });
  const FULL: Array<[string, string]> = [
    ["og:title", "Contact"],
    ["og:description", "Write to us"],
    ["og:image", "https://stampeo.app/opengraph-image?1"],
    ["og:site_name", "Stampeo"],
    ["og:type", "website"],
  ];

  test("passes a full block", () => {
    expect(openGraphProblems(og(...FULL))).toEqual([]);
  });

  test("fails a page that dropped its image and left the description empty", () => {
    const partial = FULL.filter(([property]) => property !== "og:image").map(([property, content]): [string, string] =>
      property === "og:description" ? [property, " "] : [property, content],
    );

    expect(openGraphProblems(og(...partial))).toEqual(["no og:description", "no og:image"]);
  });
});

describe("hiddenHeaderLinkProblems", () => {
  const header = (inside: string) => page({ body: `<header>${inside}</header><footer><div aria-hidden="true"><a href="/en/footer">x</a></div></footer>` });

  test("passes a header whose links are visible, with aria-hidden used only on icons", () => {
    const html = header('<a href="/en"><span aria-hidden="true">★</span> Stampeo</a><nav><a class="[&>svg]:size-4" href="/en/pricing">Pricing</a></nav>');

    expect(hiddenHeaderLinkProblems(html)).toEqual([]);
  });

  test("fails a header holding an aria-hidden block of links, nested or on the link itself", () => {
    const html = header('<nav aria-hidden="true"><ul><li><a href="/en/about">About</a></li></ul></nav><a aria-hidden="true" tabindex="-1" href="/en/blog">Blog</a><a href="/en">Home</a>');

    expect(hiddenHeaderLinkProblems(html)).toEqual([
      "aria-hidden link in the header: /en/about",
      "aria-hidden link in the header: /en/blog",
    ]);
  });
});

describe("fontPreloadProblems", () => {
  const preload = (href: string) => `<link rel="preload" href="${href}" as="font" crossorigin="" type="font/woff2"/>`;

  test("passes two preloaded fonts and ignores other preloads", () => {
    const head = `${preload("/a.woff2")}${preload("/b.woff2")}<link rel="preload" href="/hero.jpg" as="image"/>`;

    expect(fontPreloadProblems(page({ head }), 2)).toEqual([]);
  });

  test("fails a third preloaded font", () => {
    const head = `${preload("/a.woff2")}${preload("/b.woff2")}${preload("/caveat.woff2")}`;

    expect(fontPreloadProblems(page({ head }), 2)).toEqual(["3 font preloads (max 2): /a.woff2, /b.woff2, /caveat.woff2"]);
  });
});

describe("indexNowKeyProblems", () => {
  const KEY = "a54facc9a2c4dbf7f5170fa9e04b6dbc";

  test("passes a body that is the key, with or without a trailing newline", () => {
    expect(indexNowKeyProblems(KEY, KEY)).toEqual([]);
    expect(indexNowKeyProblems(`${KEY}\n`, KEY)).toEqual([]);
  });

  test("fails a 404 page served in place of the key file", () => {
    expect(indexNowKeyProblems("<html>Not found</html>", KEY)).toEqual(['body is "<html>Not found</html>", expected the key']);
  });
});

describe("breadcrumbProblems", () => {
  const breadcrumb = (...urls: string[]) =>
    page({
      body: `<script type="application/ld+json">${JSON.stringify({
        "@type": "BreadcrumbList",
        itemListElement: urls.map((item, index) => ({ "@type": "ListItem", position: index + 1, item })),
      })}</script>`,
    });

  test("passes an English trail whose items all sit under /en", () => {
    const html = breadcrumb("https://stampeo.app/en", "https://stampeo.app/en/blog", "https://stampeo.app/en/blog/a-post");

    expect(breadcrumbProblems(html, "/en")).toEqual([]);
  });

  test("fails an English post whose trail leads back to French URLs", () => {
    const html = breadcrumb("https://stampeo.app/", "https://stampeo.app/blog", "https://stampeo.app/en/blog/a-post");

    expect(breadcrumbProblems(html, "/en")).toEqual([
      "breadcrumb item / is outside /en",
      "breadcrumb item /blog is outside /en",
    ]);
  });

  test("a prefix is not a string prefix: /english is outside /en", () => {
    expect(breadcrumbProblems(breadcrumb("https://stampeo.app/english"), "/en")).toEqual([
      "breadcrumb item /english is outside /en",
    ]);
  });

  test("fails a page with no breadcrumb", () => {
    expect(breadcrumbProblems(page({ body: "<main/>" }), "/en")).toEqual(["no BreadcrumbList items"]);
  });
});
