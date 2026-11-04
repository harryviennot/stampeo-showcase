import { describe, expect, it } from "bun:test";
import { fixturePage } from "./__fixtures__";
import { comparisonJsonLd } from "./structured-data";

const CHECKED = "2026-10-05";

/** Every object in a JSON-LD tree. */
function nodesOf(value: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(value)) return value.flatMap(nodesOf);
  if (value && typeof value === "object") {
    return [value as Record<string, unknown>, ...Object.values(value).flatMap(nodesOf)];
  }
  return [];
}
const typesOf = (value: unknown) => nodesOf(value).flatMap((node) => [node["@type"]].flat().filter(Boolean));

describe.each([
  ["a US page", "acme-loyalty", "Acme Loyalty", "https://stampeo.app/us", "https://stampeo.app/us/vs/acme-loyalty"],
  ["a FR page", "acme-fidelite", "Acme Fidélité", "https://stampeo.app/", "https://stampeo.app/comparatif/acme-fidelite"],
])("structured data of %s", (_name, slug, competitorName, homeUrl, pageUrl) => {
  const page = fixturePage(slug);
  const nodes = comparisonJsonLd(page, CHECKED);

  it("is a page, a breadcrumb and an FAQ", () => {
    expect(nodes).toHaveLength(3);
    expect(nodes.map((node) => node["@type"])).toEqual(["WebPage", "BreadcrumbList", "FAQPage"]);
  });

  it("dates the page by the computed check date and points at its own URL", () => {
    expect(nodes[0]).toMatchObject({ name: page.title, description: page.description, url: pageUrl, dateModified: CHECKED });
  });

  it("walks from the home page of the market to the page", () => {
    const items = nodes[1].itemListElement as Array<{ position: number; item: string }>;
    expect(items.map((item) => item.item)).toEqual([homeUrl, pageUrl]);
  });

  it("builds the FAQ from the frontmatter, question for question", () => {
    const questions = (nodes[2].mainEntity as Array<{ name: string; acceptedAnswer: { text: string } }>).map((q) => [q.name, q.acceptedAnswer.text]);
    expect(questions).toEqual(page.faqs.map((faq) => [faq.question, faq.answer]));
  });

  it("never describes the competitor as a product, an organization or something with a rating", () => {
    const forbidden = ["Product", "Review", "AggregateRating", "Rating", "Offer", "SoftwareApplication", "Brand"];
    expect(typesOf(nodes).filter((type) => forbidden.includes(String(type)))).toEqual([]);
    const entities = ["Organization", "Corporation", "LocalBusiness", "Person", "Brand"];
    const named = nodesOf(nodes).filter(
      (node) => entities.includes(String(node["@type"])) && String(node.name ?? "").includes(competitorName),
    );
    expect(named).toEqual([]);
    expect(JSON.stringify(nodes)).not.toMatch(/aggregateRating|reviewRating|"review"/);
  });
});
