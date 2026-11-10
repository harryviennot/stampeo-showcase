import { describe, expect, it } from "bun:test";
import { visibleText, wordsChanged } from "./compare-visible-text";

describe("the words a comparison page's MDX shows", () => {
  it("are its text with the frontmatter, markdown marks and tags taken away, and every kind of space a plain one", () => {
    const source = `---
title: Hidden
---

Opening **bold** and a [link](https://example.com/x).

## A heading&nbsp;?

- one;
- two.

<ComparisonTable />`;

    expect(visibleText(source)).toBe("Opening bold and a link. A heading ? one; two.");
  });

  it("keep where a fact is written, so a fact that moves or changes is seen", () => {
    expect(visibleText('Costs <Fact id="price.entry" /> a month.')).toBe("Costs {price.entry} a month.");
  });

  it("keep the words a tag carries in its title or shop, at the place the tag sits", () => {
    const source = `<ChooseIf side="stampeo" title={"Choose Stampeo if"}>

- Yes.

</ChooseIf>

<Fit side="competitor" shop="A café:">
Acme, with an app.
</Fit>`;

    expect(visibleText(source)).toBe("Choose Stampeo if Yes. A café: Acme, with an app.");
  });
});

describe("a restructure that changes no word", () => {
  const BEFORE = `## Prices

As of today:

- **Acme:** <Fact id="price.entry" />; <Fact id="price.mid" />.
- **Stampeo:** Starter, <Fact id="stampeo.price.starter" />.

**One shop.** Compare.

- **A café:** Acme, with an app.
- **A bakery**&nbsp;: Stampeo.`;

  const AFTER = `## Prices

As of today:

<PriceCard side="competitor" title="Acme:">

- <Fact id="price.entry" />;
- <Fact id="price.mid" />.

</PriceCard>

<PriceCard side="stampeo" title="Stampeo:">

- Starter, <Fact id="stampeo.price.starter" />.

</PriceCard>

**One shop.** Compare.

<Fit side="competitor" shop="A café:">
Acme, with an app.
</Fit>

<Fit side="stampeo" shop="A bakery&nbsp;:">
Stampeo.
</Fit>`;

  it("reads the same before and after", () => {
    expect(visibleText(AFTER)).toBe(visibleText(BEFORE));
    expect(wordsChanged(BEFORE, AFTER)).toBeNull();
  });

  it.each([
    ["a word changed", AFTER.replace("Compare.", "Compare them.")],
    ["a sentence moved", AFTER.replace("**One shop.** Compare.\n\n", "") + "\n\n**One shop.** Compare."],
    ["a fact swapped", AFTER.replace("price.mid", "price.top")],
    ["a title dropped", AFTER.replace(' title="Acme:"', "")],
  ])("is caught when %s", (_name, changed) => {
    const diff = wordsChanged(BEFORE, changed);
    expect(diff).not.toBeNull();
    expect(diff).toContain("before:");
    expect(diff).toContain("after:");
  });
});
