import { describe, expect, test } from "bun:test";

import {
  alternateProblems,
  canonicalProblems,
  jsonLdProblems,
  priceProblems,
  redirectProblems,
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
    '<h3>Starter</h3><p><span>20<!-- --> €</span><span>/mois</span></p><h3>Growth</h3><p><span>40 €</span><span>/mois</span></p>';
  const USD_LADDER =
    '<h3>Starter</h3><p><span>$<!-- -->49</span><span>/mo</span></p><p>Start your <span>14</span>-day free trial</p>';

  test("passes server-rendered prices in the page's currency", () => {
    expect(priceProblems(page({ body: EUR_LADDER }), { currency: "€" })).toEqual([]);
    expect(priceProblems(page({ body: USD_LADDER }), { currency: "$", trialDays: 14 })).toEqual([]);
  });

  test("fails a price skeleton left in front of the per-month suffix", () => {
    const skeleton =
      '<h3>Starter</h3><p><span class="animate-pulse rounded bg-muted h-8 w-16"></span><span>/month</span></p><p>$49/month</p>';

    const problems = priceProblems(page({ body: skeleton }), { currency: "$" });
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain('empty price before "/month"');
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
