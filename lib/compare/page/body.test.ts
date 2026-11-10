import { describe, expect, it } from "bun:test";
import { arrangeBody, splitVerdict } from "./body";

const COMPETITOR = '<ChooseIf side="competitor">\n\n- Their side.\n\n</ChooseIf>';
const STAMPEO = '<ChooseIf side="stampeo">\n\n- Our side.\n\n</ChooseIf>';
const PRICE_COMPETITOR = '<PriceCard side="competitor">\n\n- <Fact id="price.entry" />\n\n</PriceCard>';
const PRICE_STAMPEO = '<PriceCard side="stampeo">\n\n- <Fact id="stampeo.price.starter" />\n\n</PriceCard>';
const STRENGTHS_COMPETITOR = '<Strengths side="competitor">\n\n**Their edge.** Words.\n\n</Strengths>';
const STRENGTHS_STAMPEO = '<Strengths side="stampeo">\n\n**Our edge.** Words.\n\n</Strengths>';
const fit = (side: string, shop: string) => `<Fit side="${side}" shop="${shop}">\n\nReason.\n\n</Fit>`;

/** The sections of an arranged page: their tone and what they hold. */
function sectionsOf(arranged: string) {
  return [...arranged.matchAll(/<PageSection tone="(plain|band)">([\s\S]*?)<\/PageSection>/g)].map((match) => ({
    tone: match[1],
    content: match[2],
  }));
}

describe("the verdict of a page", () => {
  it("is its first paragraph, and the rest of the page follows", () => {
    const { verdict, rest } = splitVerdict(`\nAcme costs <Fact id="price.entry" />,\nStampeo less.\n\n## Prices\n\nMore.\n`);

    expect(verdict).toBe('Acme costs <Fact id="price.entry" />,\nStampeo less.');
    expect(rest.trim()).toBe("## Prices\n\nMore.");
  });

  it.each([
    ["a component", `${COMPETITOR}\n\nText.`],
    ["a heading", "## Choose Acme if\n\nText."],
    ["a list", "- one\n- two\n\nText."],
    ["a quote", "> quoted\n\nText."],
    ["nothing", "   \n"],
  ])("is absent when the page opens with %s", (_name, content) => {
    expect(splitVerdict(content).verdict).toBeNull();
    expect(splitVerdict(content).rest).toBe(content);
  });

  it("can open on an inline fact", () => {
    expect(splitVerdict('<Fact id="stampeo.trial" /> is ours.\n\nMore.').verdict).toBe('<Fact id="stampeo.trial" /> is ours.');
  });
});

describe("the Choose if cards of a page", () => {
  it("sit in one pair when written back to back, whichever order they were written in", () => {
    for (const [first, second] of [[COMPETITOR, STAMPEO], [STAMPEO, COMPETITOR]]) {
      const arranged = arrangeBody(`Intro.\n\n${first}\n\n${second}\n\n<ComparisonTable />`);

      const pair = arranged.indexOf("<ChooseIfPair>");
      expect(pair).toBeGreaterThan(arranged.indexOf("Intro."));
      expect(arranged.indexOf(first)).toBeGreaterThan(pair);
      expect(arranged.indexOf("</ChooseIfPair>")).toBeGreaterThan(arranged.indexOf(second));
      expect(arranged.indexOf("</ChooseIfPair>")).toBeLessThan(arranged.indexOf("<ComparisonTable />"));
    }
  });

  it("stay as written when something sits between them", () => {
    const arranged = arrangeBody(`${COMPETITOR}\n\nSome words.\n\n${STAMPEO}\n\nAfter.`);

    expect(arranged).not.toContain("ChooseIfPair");
  });

  it("take a heading written right above them as their title, and then sit back to back", () => {
    const arranged = arrangeBody(`## Choose Acme if\n\n${COMPETITOR}\n\n## Choose Stampeo if\n\n${STAMPEO}`);

    expect(arranged).not.toMatch(/^##/m);
    expect(arranged).toContain('<ChooseIf side="competitor" title={"Choose Acme if"}>');
    expect(arranged).toContain('<ChooseIf side="stampeo" title={"Choose Stampeo if"}>');
    expect(arranged).toContain("<ChooseIfPair>");
  });

  it("leave a heading that does not sit right above a card where it is", () => {
    const arranged = arrangeBody(`## Prices\n\nSome words.\n\n${COMPETITOR}\n\n${STAMPEO}`);

    expect(arranged).toContain("## Prices");
    expect(arranged).not.toContain("title=");
  });

  it("get no call to action added: the Stampeo card carries the sign-up button, and a writer places any other", () => {
    expect(arrangeBody(`${COMPETITOR}\n\n${STAMPEO}`)).not.toContain("CallToAction");
    expect(arrangeBody(`${COMPETITOR}\n\n${STAMPEO}\n\n<CallToAction title="Try it" buttonText="Go" />`).match(/<CallToAction/g)).toHaveLength(1);
  });

  it("leave a page without them alone", () => {
    expect(arrangeBody("Just text.")).not.toContain("ChooseIf");
  });
});

describe("the other side-by-side components of a page", () => {
  it.each([
    ["prices", PRICE_COMPETITOR, PRICE_STAMPEO, "PriceCardPair"],
    ["strengths", STRENGTHS_COMPETITOR, STRENGTHS_STAMPEO, "StrengthsPair"],
  ])("put the %s of both products in one pair when they sit back to back, whichever comes first", (_name, competitor, stampeo, wrapper) => {
    for (const [first, second] of [[competitor, stampeo], [stampeo, competitor]]) {
      const arranged = arrangeBody(`${first}\n\n${second}`);
      expect(arranged).toContain(`<${wrapper}>`);
      expect(arranged.indexOf(`</${wrapper}>`)).toBeGreaterThan(arranged.indexOf(second));
    }
  });

  it("leave a card alone when its twin is not right next to it", () => {
    expect(arrangeBody(`${PRICE_COMPETITOR}\n\nWords between.\n\n${PRICE_STAMPEO}`)).not.toContain("PriceCardPair");
  });

  it("take the heading above a strengths block as its title", () => {
    const arranged = arrangeBody(`## Where Acme is stronger\n\n${STRENGTHS_COMPETITOR}\n\n## Where Stampeo is stronger\n\n${STRENGTHS_STAMPEO}`);

    expect(arranged).not.toMatch(/^##/m);
    expect(arranged).toContain('<Strengths side="competitor" title={"Where Acme is stronger"}>');
    expect(arranged).toContain("<StrengthsPair>");
  });

  it("gather the by-type-of-shop rows, whichever product each picks, into one list", () => {
    const arranged = arrangeBody(`## Which fits?\n\n${fit("competitor", "A café")}\n\n${fit("stampeo", "A bakery")}\n\n${fit("stampeo", "A salon")}\n\n## Switching\n\nWords.`);

    expect(arranged.match(/<FitList>/g)).toHaveLength(1);
    expect(arranged.indexOf("</FitList>")).toBeGreaterThan(arranged.indexOf("A salon"));
    expect(arranged.indexOf("</FitList>")).toBeLessThan(arranged.indexOf("## Switching"));
  });
});

describe("the sections of a page", () => {
  const PAGE = [
    COMPETITOR,
    STAMPEO,
    "## Side by side\n\nAn aside.\n\n<ComparisonTable />",
    `## How the prices compare\n\nAs of today:\n\n${PRICE_COMPETITOR}\n\n${PRICE_STAMPEO}\n\n**One shop.** Words.`,
    `## Where Acme is stronger\n\n${STRENGTHS_COMPETITOR}`,
    `## Where Stampeo is stronger\n\n${STRENGTHS_STAMPEO}`,
    `## Which fits?\n\n${fit("competitor", "A café")}`,
    "## Switching\n\nMove over.",
  ].join("\n\n");

  const sections = sectionsOf(arrangeBody(PAGE));

  it("put the table and the two strengths on bands, and everything else on plain sections", () => {
    expect(sections.map((section) => section.tone)).toEqual(["plain", "band", "plain", "band", "plain"]);
  });

  it("give each section the words that belong to it, in the order the writer wrote them", () => {
    expect(sections[0].content).toContain("<ChooseIfPair>");
    expect(sections[1].content).toMatch(/^\s*## Side by side[\s\S]*An aside\.[\s\S]*<ComparisonTable \/>\s*$/);
    expect(sections[2].content).toContain("## How the prices compare");
    expect(sections[2].content).toContain("<PriceCardPair>");
    expect(sections[2].content).toContain("**One shop.**");
    expect(sections[3].content).toContain("<StrengthsPair>");
    expect(sections[4].content).toContain("## Which fits?");
    expect(sections[4].content).toContain("<FitList>");
    expect(sections[4].content).toContain("## Switching");
  });

  it("leave no words outside a section", () => {
    const outside = arrangeBody(PAGE).replace(/<PageSection tone="(?:plain|band)">[\s\S]*?<\/PageSection>/g, "");
    expect(outside.trim()).toBe("");
  });

  it("make a plain section of a page that has none of the special parts", () => {
    expect(sectionsOf(arrangeBody("Just text.\n\n## A heading\n\nMore."))).toEqual([
      { tone: "plain", content: expect.stringContaining("Just text.") },
    ]);
  });

  it("ignore a heading inside a code fence", () => {
    const fenced = "## One\n\n```\n## not a heading\n```\n\n<ComparisonTable />";
    expect(sectionsOf(arrangeBody(fenced)).map((section) => section.tone)).toEqual(["band"]);
  });
});
