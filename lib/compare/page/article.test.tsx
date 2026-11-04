import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ComparisonArticle } from "@/components/compare/ComparisonArticle";
import { ComparisonTable } from "@/components/compare/ComparisonTable";
import { CallToAction } from "@/components/blog/mdx/CallToAction";
import { FeatureCTA } from "@/components/features/FeatureCTA";
import { FALLBACK_PRICING, formatMoney } from "@/lib/pricing";
import { loadCatalog } from "@/lib/testing/catalogs";
import { checkedDate } from "../checked";
import { FIXTURES, withUsFacts } from "../__fixtures__";
import { fixtureView } from "../__fixtures__/view";
import { COPY } from "./copy";
import { compileComparisonMDX } from "./mdx";
import { otherComparisons } from "./load";

// A click is reported by where its link sits, so the tests read the location and href the tracking hook is given.
type Click = { trackAs: string; href: string };
const clicks: Click[] = [];
const realTracking = await import("@/hooks/use-cta-tracking");
mock.module("@/hooks/use-cta-tracking", () => ({
  useCtaTracking: (trackAs: string, href: string) => {
    clicks.push({ trackAs, href });
    return () => {};
  },
}));
afterAll(() => mock.module("@/hooks/use-cta-tracking", () => realTracking));

const LOCALE = { us: "en", fr: "fr" } as const;

/** The markup of a node on a page in the given locale; `clicks` holds what it reported. */
function renderIn(locale: "en" | "fr", node: ReactNode): string {
  clicks.length = 0;
  return renderToStaticMarkup(
    <NextIntlClientProvider locale={locale} messages={loadCatalog(locale)} timeZone="UTC">
      {node}
    </NextIntlClientProvider>,
  );
}

async function render(slug: string) {
  const view = fixtureView(slug);
  const { verdict, body } = await compileComparisonMDX(view);
  const html = renderIn(
    LOCALE[view.page.market],
    <ComparisonArticle view={view} verdict={verdict} body={body} others={otherComparisons(view, FIXTURES)} />,
  );
  return { html, clicks: [...clicks] };
}

/** The visible words: tags dropped, entities decoded, every kind of space a plain one. */
const text = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/[  ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
/** Page order is read from what is drawn, not from the structured data that sits above it. */
const drawn = (html: string) => html.replace(/<script[\s\S]*?<\/script>/g, "");
const at = (html: string, needle: string | RegExp) => {
  const index = typeof needle === "string" ? html.indexOf(needle) : html.search(needle);
  expect({ needle: String(needle), found: index >= 0 }).toEqual({ needle: String(needle), found: true });
  return index;
};

describe("a US comparison page", () => {
  let html = "";
  beforeAll(async () => {
    ({ html } = await render("acme-loyalty"));
  });

  it("reads top to bottom: title, verdict, check date, the two cards, the table, the FAQ, sources, other pages, closing call to action", () => {
    const page = drawn(html);
    const order = [
      at(page, "<h1"),
      at(page, "Acme Loyalty&#x27;s cheapest plan"),
      at(page, "Checked October 5, 2026"),
      at(page, "Choose Acme Loyalty if"),
      at(page, "Choose Stampeo if"),
      at(page, COPY.us.cta.title),
      at(page, "<table"),
      at(page, "Can I move my Acme Loyalty customers"),
      at(page, 'id="sources"'),
      at(page, "/us/vs/globex-stamps"),
      at(page, COPY.us.closing.title),
    ];
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it("has one H1, in the market's wording, and an H2 for every section after it", () => {
    expect(html.match(/<h1/g)).toHaveLength(1);
    expect(text(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)![1])).toBe("Acme Loyalty vs Stampeo");
    const sections = [...html.matchAll(/<h2[^>]*id="([^"]+)"/g)].map((match) => match[1]);
    expect(sections).toEqual(expect.arrayContaining(["faq", "sources", "other-comparisons"]));
  });

  it("says how old the facts are and carries no author byline, only the disclaimer that the page is Stampeo's own", () => {
    expect(text(html)).not.toMatch(/\bBy [A-Z]|Harry|[Ff]ounder|\bauthor\b/);
    expect(text(html)).toContain("Written by Stampeo. Competitor information is accurate as of the date checked above.");
  });

  it("shows the verdict first, with prices read from the facts and the catalog in dollars", () => {
    const starter = formatMoney(FALLBACK_PRICING.usd.tiers.starter.month, "usd", "en");
    expect(text(html)).toContain(`Acme Loyalty's cheapest plan is $25 a month, billed monthly. Stampeo's Starter plan is ${starter} a month`);
    expect(html).not.toContain("€");
  });

  it("puts the two Choose if cards side by side, the competitor's first, each with its own bullets", () => {
    const pair = html.slice(at(html, "data-choose-if-pair"), at(html, COPY.us.cta.title));
    expect(pair.match(/<section/g)).toHaveLength(2);
    expect(at(pair, "Choose Acme Loyalty if")).toBeLessThan(at(pair, "Choose Stampeo if"));
    expect(pair).toContain("<li>You want your customers to have a dedicated app.</li>");
    expect(pair).toContain("<li>You want a card in the wallet your customers already have.</li>");
  });

  it("has one real table: a row per fact, Stampeo on the right", () => {
    expect(html.match(/<table/g)).toHaveLength(1);
    expect(html).toMatch(/<th[^>]*scope="col"/);
    for (const label of ["Where the customer's card lives", "Cheapest paid plan", "Free trial"]) expect(text(html)).toContain(label);
    expect(html.match(/<th[^>]*scope="row"/g)).toHaveLength(4);
    const head = html.match(/<thead[\s\S]*?<\/thead>/)![0];
    expect(at(head, "Acme Loyalty")).toBeLessThan(at(head, "Stampeo"));
  });

  it("lists its sources by title, domain and the day they were read, then the correction contact", () => {
    expect(html).toContain('href="mailto:contact@stampeo.app"');
    expect(html).toContain("Acme Loyalty pricing");
    expect(html).toContain("acme-loyalty.example");
    expect(html).toContain("Read on October 5, 2026");
    expect(html).not.toContain(">https://acme-loyalty.example/pricing<");
    expect(at(html, "Acme Loyalty pricing")).toBeLessThan(at(html, "mailto:contact@stampeo.app"));
  });

  it("lists the FAQ from the frontmatter, and the data behind it is in the same HTML", () => {
    expect(html.match(/<details/g)).toHaveLength(2);
    const nodes = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
    expect(nodes.map((node) => node["@type"])).toEqual(["WebPage", "BreadcrumbList", "FAQPage"]);
    expect(nodes[2].mainEntity.map((q: { name: string }) => q.name)).toEqual([
      "Can I move my Acme Loyalty customers to Stampeo?",
      "Does Stampeo need an app for customers?",
    ]);
  });

  it("links to the other published comparisons of the market and to no draft", () => {
    expect(html).toContain('href="/us/vs/globex-stamps"');
    expect(html).not.toContain("acme-loyalty-draft");
    expect(html).not.toContain('href="/us/vs/acme-loyalty"');
    expect(html).not.toContain("/comparatif/");
  });
});

describe("a US page that opens on the cards", () => {
  let page: Awaited<ReturnType<typeof render>>;
  beforeAll(async () => {
    page = await render("globex-stamps");
  });

  it("has no verdict, but still the table, the check date, the sign-up buttons, sources and the contact", () => {
    const { html } = page;
    expect(text(html.slice(html.indexOf("</h1>"), at(html, "Checked ")))).toBe("");
    expect(html.match(/<table/g)).toHaveLength(1);
    expect(page.clicks).toHaveLength(2);
    expect(html).toContain("mailto:contact@stampeo.app");
  });

  it("links to the first page of the market", () => {
    expect(page.html).toContain('href="/us/vs/acme-loyalty"');
  });
});

describe("a French comparison page", () => {
  let html = "";
  beforeAll(async () => {
    ({ html } = await render("acme-fidelite"));
  });

  it("is all in French, with the French H1, check line and disclaimer", () => {
    expect(text(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)![1])).toBe("Acme Fidélité ou Stampeo : lequel choisir pour votre commerce ?");
    expect(text(html)).toContain("Vérifié le 12 octobre 2026");
    expect(text(html)).toContain("Comparatif rédigé par Stampeo.");
    expect(text(html)).toContain("Choisissez Acme Fidélité si");
    expect(text(html)).toContain("Choisissez Stampeo si");
    expect(html).toContain("Questions fréquentes");
  });

  it("prices Stampeo in euros with no VAT and never shows a dollar", () => {
    expect(text(html)).toContain("TVA non applicable");
    expect(text(html)).not.toContain("$");
  });

  it("shows the competitor's HT price with its TTC equivalent", () => {
    expect(text(html)).toContain("19 € HT (soit 22,80 € TTC, TVA à 20 %) par mois");
  });

  it("lists its sources in French, then the correction contact and the disclaimer", () => {
    const sources = html.slice(at(html, 'id="sources"'));
    expect(text(sources)).toContain("Lu le 12 octobre 2026");
    expect(text(sources)).toContain("Lu le 25 octobre 2026");
    expect(text(sources)).not.toContain("Read on");
    expect(text(sources)).toContain("Une information vous semble fausse ou périmée ? Écrivez à");
    expect(text(sources)).toContain("nous la corrigeons sous une semaine.");
    expect(sources).toContain('href="mailto:contact@stampeo.app"');
    expect(text(sources)).toContain(
      "Comparatif rédigé par Stampeo. Les informations sur les concurrents sont exactes à la date de vérification indiquée.",
    );
  });

  it("links to the other French comparisons, in French", () => {
    expect(html).toContain('href="/comparatif/bravo-carte"');
    expect(text(html)).toContain("Bravo Carte ou Stampeo");
    expect(html).not.toContain("acme-fidelite-brouillon");
    expect(html).not.toContain("/us/vs/");
  });
});

describe("a page whose facts were read long ago", () => {
  it("still renders, and says when they were checked", async () => {
    const view = fixtureView("acme-loyalty");
    const competitor = withUsFacts(view.competitor, (facts) => facts.map((fact) => ({ ...fact, checkedAt: "2025-01-15" })));
    const old = { ...view, competitor, checkedAt: checkedDate(view.page, competitor) };
    const { verdict, body } = await compileComparisonMDX(old);

    const html = renderIn("en", <ComparisonArticle view={old} verdict={verdict} body={body} others={[]} />);
    expect(text(html)).toContain("Checked January 15, 2025");
    expect(text(html)).toContain("Acme Loyalty's cheapest plan is $25 a month");
  });
});

describe.each([
  ["a US page", "acme-loyalty"],
  ["a French page", "acme-fidelite"],
])("the sign-up buttons of %s", (_name, slug) => {
  it("are one after the Choose if cards and one at the end, each from its own location, both going to /onboarding", async () => {
    expect((await render(slug)).clicks).toEqual([
      { trackAs: "comparison_cta", href: "/onboarding" },
      { trackAs: "comparison_final_cta", href: "/onboarding" },
    ]);
  });
});

describe("the table's semantics", () => {
  const html = renderToStaticMarkup(<ComparisonTable view={fixtureView("acme-loyalty")} />);

  it("keeps them when the browser stops drawing a table", () => {
    expect(html).toContain('role="table"');
    expect(html.match(/role="row"/g)!.length).toBeGreaterThanOrEqual(5);
    expect(html).toContain('role="rowheader"');
    expect(html).toContain('role="cell"');
  });

  it("pairs a yes or a no with an icon, hidden from screen readers since the word is there", () => {
    // Acme's only yes/no answer is on the customer-app row, which stays iconless; give it a till row too.
    const view = fixtureView("acme-loyalty");
    const withTill = {
      ...view,
      competitor: withUsFacts(view.competitor, (facts) => [...facts, { ...facts[0], id: "pos.integration", value: "No till integration" }]),
    };
    expect(renderToStaticMarkup(<ComparisonTable view={withTill} />)).toMatch(/<svg[^>]*aria-hidden="true"/);
  });
});

describe("where a button or a link reports its click from", () => {
  it("a blog post's call to action keeps its own location unless told otherwise", () => {
    const locationOf = (props: object) => {
      renderIn("en", <CallToAction title="t" buttonText="b" {...props} />);
      return clicks[0].trackAs;
    };
    expect(locationOf({})).toBe("blog_cta");
    expect(locationOf({ trackAs: "comparison_cta" })).toBe("comparison_cta");
  });

  it("a feature page's call to action keeps its own location unless told otherwise", () => {
    const locationOf = (props: object) => {
      renderIn("en", <FeatureCTA title="t" subtitle="s" {...props} />);
      return clicks[0].trackAs;
    };
    expect(locationOf({})).toBe("feature_cta");
    expect(locationOf({ trackAs: "comparison_final_cta" })).toBe("comparison_final_cta");
  });

  it("a link to the sign-up page written in a comparison reports the comparison's location, not the blog's", async () => {
    const view = fixtureView("acme-loyalty");
    const linked = { ...view, page: { ...view.page, content: `${view.page.content}\n\nTry it on the [sign-up page](/onboarding) today.` } };
    const { body } = await compileComparisonMDX(linked);

    renderIn("en", body);
    expect(clicks).toContainEqual({ trackAs: "comparison_link", href: "/onboarding" });
    expect(clicks.map((click) => click.trackAs)).not.toContain("blog_link");
  });
});
