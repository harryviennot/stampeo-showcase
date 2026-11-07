import { afterAll, beforeAll, describe, expect, it, mock } from "bun:test";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ComparisonArticle } from "@/components/compare/ComparisonArticle";
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
    <ComparisonArticle view={view} verdict={verdict} body={body} others={otherComparisons(view, FIXTURES)} heroVisual={<div data-hero-visual />} />,
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
    .replace(/[\u00a0\u202f]/g, " ")
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

  it("reads top to bottom: title, verdict, check date, card stack, the two cards with the sign-up button, the table, the FAQ, sources, other pages, closing call to action", () => {
    const page = drawn(html);
    const order = [
      at(page, "<h1"),
      at(page, "Acme Loyalty&#x27;s cheapest plan"),
      at(page, "Checked October 5, 2026"),
      at(page, "data-hero-visual"),
      at(page, "Choose Acme Loyalty if"),
      at(page, "Choose Stampeo if"),
      at(page, COPY.us.cta.button),
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
    const pair = html.slice(at(html, "data-choose-if-pair"), at(html, "space-y-4 md:hidden"));
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
    const faq = html.slice(at(html, 'id="faq"'), at(html, 'id="sources"'));
    expect(faq.match(/<details/g)).toHaveLength(2);
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

/** A page that uses every part of the layout, the two products written in an order the page must not follow. */
const FULL_PAGE = `Acme Loyalty costs <Fact id="price.entry" />.

## Choose Stampeo if

<ChooseIf side="stampeo">

- You want a wallet card.

</ChooseIf>

## Choose Acme Loyalty if

<ChooseIf side="competitor">

- You want an app.

</ChooseIf>

## Side by side

<ComparisonTable />

## How the prices compare

As of today:

<PriceCard side="stampeo" title="Stampeo:">

- Starter, <Fact id="stampeo.price.starter" />;
- Growth, <Fact id="stampeo.price.growth" />.

</PriceCard>

<PriceCard side="competitor" title="Acme Loyalty:">

- <Fact id="price.entry" />.

</PriceCard>

**One shop.** Compare the first plans.

## Where Stampeo is stronger

<Strengths side="stampeo">

**Points and levels.** Stampeo runs points on every plan.

</Strengths>

## Where Acme Loyalty is stronger

<Strengths side="competitor">

**Connections.** Acme Loyalty links to other tools.

**Messages.** Acme Loyalty sends messages from Starter.

</Strengths>

## Which fits your shop?

<Fit side="competitor" shop="A café that runs orders through other software:">
Acme Loyalty, which connects through Zapier.
</Fit>

<Fit side="stampeo" shop="A bakery that rewards spending:">
Stampeo, with points.
</Fit>

## Switching from Acme Loyalty

Scan the flyer.`;

describe("a page laid out in full", () => {
  let html = "";
  let page = "";
  beforeAll(async () => {
    const view = fixtureView("acme-loyalty");
    const full = { ...view, page: { ...view.page, content: FULL_PAGE } };
    const { verdict, body } = await compileComparisonMDX(full);
    html = renderIn("en", <ComparisonArticle view={full} verdict={verdict} body={body} others={[]} heroVisual={<div data-hero-visual />} />);
    page = drawn(html);
  });

  /** A whole element of the page, from the tag that carries `attribute` to its closing tag. */
  const element = (tag: string, attribute: string) => {
    const found = page.match(new RegExp(`<${tag}\\b[^>]*${attribute}[\\s\\S]*?</${tag}>`));
    expect({ attribute, found: found !== null }).toEqual({ attribute, found: true });
    return found![0];
  };

  it("has no table of contents and no blog shell, and its headings keep their anchors", () => {
    expect(html).not.toContain("<aside");
    expect(html).not.toContain("--blog-bg)] min-h-screen");
    for (const id of ["side-by-side", "how-the-prices-compare", "switching-from-acme-loyalty", "faq", "sources"]) {
      expect(html).toContain(`id="${id}"`);
    }
  });

  it("opens with the title, the verdict and a check-date pill beside the card stack", () => {
    const hero = page.slice(0, at(page, "data-choose-if-pair"));
    expect(text(hero)).toContain("Acme Loyalty vs Stampeo");
    expect(text(hero)).toContain("Acme Loyalty costs $25 a month, billed monthly.");
    expect(text(hero)).toContain("Checked October 5, 2026");
    expect(hero).toContain("data-hero-visual");
    expect(hero).toMatch(/rounded-full[^"]*"[^>]*>(?:(?!<\/p>)[\s\S])*Checked/);
  });

  it("puts the competitor's card, price card and strengths first at every width, though the page wrote Stampeo's first", () => {
    for (const attribute of ["data-choose-if", "data-price-card", "data-strengths"]) {
      expect(page).toMatch(new RegExp(`${attribute}="competitor"[^>]*class="[^"]*\\border-1\\b`));
      expect(page).toMatch(new RegExp(`${attribute}="stampeo"[^>]*class="[^"]*\\border-2\\b`));
    }
  });

  it("ends the Stampeo card with the sign-up button, and gives the competitor's card none", () => {
    const stampeo = element("section", 'data-choose-if="stampeo"');
    const competitor = element("section", 'data-choose-if="competitor"');

    expect(stampeo).toContain('href="/en/onboarding"');
    expect(stampeo.lastIndexOf("<a ")).toBeGreaterThan(stampeo.lastIndexOf("<li"));
    expect(competitor).not.toContain("<a ");
  });

  it("shows each price card under its own name, one line per price, from the facts and the catalog", () => {
    const stampeo = element("div", 'data-price-card="stampeo"');
    const competitor = element("div", 'data-price-card="competitor"');

    expect(text(competitor)).toContain("Acme Loyalty $25 a month, billed monthly.");
    expect(text(competitor)).not.toContain("Acme Loyalty:");
    expect(text(stampeo)).toContain("Stampeo Starter, $29 a month; Growth, $49 a month.");
    expect(stampeo.match(/<li/g)).toHaveLength(2);
  });

  it("makes a card of each bold-lead paragraph of the strengths, under the section's own heading and anchor", () => {
    const competitor = element("section", 'data-strengths="competitor"');

    expect(competitor).toContain('id="where-acme-loyalty-is-stronger"');
    expect(competitor.match(/<h3/g)).toHaveLength(2);
    expect(text(competitor)).toContain("Where Acme Loyalty is stronger Connections Acme Loyalty links to other tools. Messages Acme Loyalty sends messages from Starter.");
    expect(text(element("section", 'data-strengths="stampeo"'))).toContain("Points and levels Stampeo runs points on every plan.");
  });

  it("lists the shop types in one list, each with its reason and a pick pill that looks the same for both products", () => {
    const rows = [...page.matchAll(/<li[^>]*data-fit="(competitor|stampeo)"[\s\S]*?<\/li>/g)];

    expect(rows.map((row) => row[1])).toEqual(["competitor", "stampeo"]);
    expect(text(rows[0][0])).toContain("A café that runs orders through other software");
    expect(text(rows[0][0])).not.toMatch(/software:/);
    expect(text(rows[0][0])).toContain("Acme Loyalty, which connects through Zapier.");
    const pill = (row: string) => row.match(/<span[^>]*data-pick[^>]*>([^<]*)</)!;
    expect(pill(rows[0][0])[1]).toBe("Acme Loyalty");
    expect(pill(rows[1][0])[1]).toBe("Stampeo");
    expect(pill(rows[0][0])[0].match(/class="([^"]*)"/)![1]).toBe(pill(rows[1][0])[0].match(/class="([^"]*)"/)![1]);
    expect(page).not.toMatch(/<p[^>]*><li/);
  });

  it("puts the table and the strengths on bands, and the rest on plain sections", () => {
    const tones = [...page.matchAll(/data-section="(plain|band)"/g)].map((match) => match[1]);
    expect(tones).toEqual(["plain", "band", "plain", "band", "plain"]);
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
