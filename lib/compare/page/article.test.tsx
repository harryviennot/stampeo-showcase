import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test";
import { NextIntlClientProvider } from "next-intl";
import { renderToStaticMarkup } from "react-dom/server";
import { ComparisonArticle } from "@/components/compare/ComparisonArticle";
import { ComparisonTable } from "@/components/compare/ComparisonTable";
import { CallToAction } from "@/components/blog/mdx/CallToAction";
import { mdxComponents as blogComponents } from "@/components/blog/mdx";
import { FeatureCTA } from "@/components/features/FeatureCTA";
import { FALLBACK_PRICING, formatMoney } from "@/lib/pricing";
import { loadCatalog } from "@/lib/testing/catalogs";
import { FIXTURES } from "../__fixtures__";
import { fixtureView } from "../__fixtures__/view";
import { compileComparisonMDX } from "./mdx";
import { otherComparisons } from "./load";

// The call to action is reported by where it sits, so the tests read the location off a stand-in button.
const realButton = await import("@/components/ui/CTAButton");
mock.module("@/components/ui/CTAButton", () => ({
  CTAButton: (props: { label: string; href?: string; trackAs: string }) => (
    <a data-track={props.trackAs} href={props.href ?? "/onboarding"}>
      {props.label}
    </a>
  ),
}));
afterAll(() => mock.module("@/components/ui/CTAButton", () => realButton));

const LOCALE = { us: "en", fr: "fr" } as const;

async function render(slug: string) {
  const view = fixtureView(slug);
  const { verdict, body } = await compileComparisonMDX(view);
  const locale = LOCALE[view.page.market];
  return renderToStaticMarkup(
    <NextIntlClientProvider locale={locale} messages={loadCatalog(locale)} timeZone="UTC">
      <ComparisonArticle view={view} verdict={verdict} body={body} others={otherComparisons(view, FIXTURES)} />
    </NextIntlClientProvider>,
  );
}

/** The visible words: tags dropped, entities decoded, every kind of space a plain one. */
const text = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/[\u00a0\u202f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const at = (html: string, needle: string | RegExp) => {
  const index = typeof needle === "string" ? html.indexOf(needle) : html.search(needle);
  expect({ needle: String(needle), found: index >= 0 }).toEqual({ needle: String(needle), found: true });
  return index;
};

describe("a US comparison page", () => {
  let html = "";
  beforeAll(async () => {
    html = await render("acme-loyalty");
  });

  it("reads top to bottom: title, verdict, check date, the two cards, the table, the FAQ, sources, other pages, closing call to action", () => {
    const order = [
      at(html, "<h1"),
      at(html, "Acme Loyalty&#x27;s cheapest plan"),
      at(html, "Checked October 5, 2026"),
      at(html, "Choose Acme Loyalty if"),
      at(html, "Choose Stampeo if"),
      at(html, 'data-track="comparison_cta"'),
      at(html, "<table"),
      at(html, "Can I move my Acme Loyalty customers"),
      at(html, 'id="sources"'),
      at(html, "/us/vs/globex-stamps"),
      at(html, 'data-track="comparison_final_cta"'),
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
    const pair = html.slice(at(html, "data-choose-if-pair"), at(html, 'data-track="comparison_cta"'));
    expect(pair.match(/<section/g)).toHaveLength(2);
    expect(at(pair, "Choose Acme Loyalty if")).toBeLessThan(at(pair, "Choose Stampeo if"));
    expect(pair).toContain("<li>You want your customers to have a dedicated app.</li>");
    expect(pair).toContain("<li>You want a card in the wallet your customers already have.</li>");
  });

  it("has one real table: a row per fact, Stampeo on the right, no red or green", () => {
    expect(html.match(/<table/g)).toHaveLength(1);
    expect(html).toMatch(/<th[^>]*scope="col"/);
    for (const label of ["Where the customer's card lives", "Cheapest paid plan", "Free trial"]) expect(text(html)).toContain(label);
    expect(html.match(/<th[^>]*scope="row"/g)).toHaveLength(4);
    expect(html).not.toMatch(/text-(?:red|green)-|bg-(?:red|green)-/);
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

  it("has a sign-up call to action after the Choose if cards and another at the end, each with its own location", () => {
    expect([...html.matchAll(/data-track="([^"]+)"/g)].map((match) => match[1])).toEqual(["comparison_cta", "comparison_final_cta"]);
  });
});

describe("a US page that opens on the cards and has no table", () => {
  let html = "";
  beforeAll(async () => {
    html = await render("globex-stamps");
  });

  it("has no verdict and no table, but still the check date, the sign-up buttons, sources and the contact", () => {
    expect(html).not.toContain("<table");
    expect(at(html, "<h1")).toBeLessThan(at(html, "Checked "));
    expect(html.match(/data-track="/g)).toHaveLength(2);
    expect(html).toContain("mailto:contact@stampeo.app");
  });

  it("links to the first page of the market", () => {
    expect(html).toContain('href="/us/vs/acme-loyalty"');
  });
});

describe("a French comparison page", () => {
  let html = "";
  beforeAll(async () => {
    html = await render("acme-fidelite");
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
});

describe("the table on a French page", () => {
  const html = renderToStaticMarkup(<ComparisonTable view={fixtureView("acme-fidelite")} />);

  it("shows the competitor's price with its tax basis beside Stampeo's price with no VAT", () => {
    const price = html.split("<tr").find((row) => row.includes("Formule payante la moins chère"))!;
    expect(text(price)).toContain("19 € HT");
    expect(text(price)).toContain("TTC");
    expect(text(price)).toContain("TVA non applicable");
  });
});

describe("the table at phone width", () => {
  const html = renderToStaticMarkup(<ComparisonTable view={fixtureView("acme-loyalty")} />);

  it("is one card per row on a phone and a table from the tablet up, from the same markup", () => {
    expect(html.match(/<table/g)).toHaveLength(1);
    expect(html).toMatch(/<table[^>]*class="[^"]*\bblock\b[^"]*md:table\b/);
    expect(html).toMatch(/<tr[^>]*class="[^"]*\bgrid\b[^"]*md:table-row\b/);
  });

  it("keeps the semantics when the browser stops drawing a table", () => {
    expect(html).toContain('role="table"');
    expect(html.match(/role="row"/g)!.length).toBeGreaterThanOrEqual(5);
    expect(html).toContain('role="rowheader"');
    expect(html).toContain('role="cell"');
  });

  it("names the vendor above each value on a phone, and tints Stampeo's side like the pricing page's Growth column", () => {
    expect(html.match(/Acme Loyalty/g)!.length).toBeGreaterThan(4);
    expect(html).toContain("bg-[var(--accent)]/5");
  });

  it("pairs a yes or a no with an icon, hidden from screen readers since the word is there", () => {
    expect(html).toMatch(/<svg[^>]*aria-hidden="true"/);
  });

  it("cannot scroll the page sideways: values wrap", () => {
    expect(html).toContain("break-words");
    expect(html).not.toContain("overflow-x-auto");
  });
});

describe("the call to action components", () => {
  it("a blog post's keeps its own location unless told otherwise", () => {
    const tracked = (trackAs?: "comparison_cta") => {
      const element = CallToAction({ title: "t", buttonText: "b", ...(trackAs ? { trackAs } : {}) });
      return (element.props.children as Array<{ props: { trackAs?: string } }>)[1].props.trackAs;
    };
    expect(tracked()).toBe("blog_cta");
    expect(tracked("comparison_cta")).toBe("comparison_cta");
  });

  it("a feature page's keeps its own location unless told otherwise", () => {
    const render = (props: object) =>
      renderToStaticMarkup(
        <NextIntlClientProvider locale="en" messages={loadCatalog("en")}>
          <FeatureCTA title="t" subtitle="s" {...props} />
        </NextIntlClientProvider>,
      );
    expect(render({})).toContain('data-track="feature_cta"');
    expect(render({ trackAs: "comparison_final_cta" })).toContain('data-track="comparison_final_cta"');
  });

  it("the blog's component set does not know the comparison components", () => {
    for (const name of ["ChooseIf", "ChooseIfPair", "Fact", "ComparisonTable"]) {
      expect(Object.keys(blogComponents)).not.toContain(name);
    }
  });
});
