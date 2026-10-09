import { describe, expect, test } from "bun:test";

import { page, PRICING_HEAD } from "./fixtures";
import {
  countBrand,
  parseAlternates,
  parseCanonical,
  parseJsonLdBlocks,
  parseMetaDescription,
  parseTitle,
} from "./html";

describe("metadata parsers", () => {
  test("read the title, description, canonical and hreflang map from the head", () => {
    const html = page({ head: PRICING_HEAD });

    expect(parseTitle(html)).toBe("Tarifs & plans | Stampeo");
    expect(parseMetaDescription(html)).toBe("Des cartes que vos clients n'oublient pas.");
    expect(parseCanonical(html)).toBe("https://stampeo.app/pricing");
    expect(parseAlternates(html)).toEqual({
      "x-default": "https://stampeo.app/en/pricing",
      fr: "https://stampeo.app/pricing",
      "en-US": "https://stampeo.app/us/pricing",
    });
  });

  test("an inline SVG <title> is not the page title", () => {
    const html = page({
      body: '<svg viewBox="0 0 10 10"><title>Stampeo logo</title></svg><title>Pricing | Stampeo</title>',
    });

    expect(parseTitle(html)).toBe("Pricing | Stampeo");
  });

  test("a page without metadata yields nulls and an empty hreflang map", () => {
    const html = page({ body: "<main>Hello</main>" });

    expect(parseTitle(html)).toBeNull();
    expect(parseMetaDescription(html)).toBeNull();
    expect(parseCanonical(html)).toBeNull();
    expect(parseAlternates(html)).toEqual({});
  });
});

describe("parseJsonLdBlocks", () => {
  test("parses a real ld+json tag, including the escaped `<`", () => {
    const html = page({
      body: '<script type="application/ld+json">{"@type":"FAQPage","name":"a \\u003c b"}</script>',
    });

    const blocks = parseJsonLdBlocks(html);
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toMatchObject({ ok: true, data: { "@type": "FAQPage", name: "a < b" } });
  });

  test("the RSC flight payload mentioning ld+json is not a block", () => {
    expect(parseJsonLdBlocks(page({ body: "<main>No data</main>" }))).toEqual([]);
  });

  test("a block that does not parse is reported as broken", () => {
    const html = page({ body: '<script type="application/ld+json">{"@type":</script>' });

    expect(parseJsonLdBlocks(html)).toEqual([
      expect.objectContaining({ ok: false, raw: '{"@type":' }),
    ]);
  });
});

describe("countBrand", () => {
  test.each([
    ["Pricing — Compare Plans | Stampeo | Stampeo", 2],
    ["Stampeo - Loyalty cards your customers actually keep", 1],
    ["STAMPEO pricing", 1],
    ["Coffee Shop Loyalty Card", 0],
  ])("%p mentions the brand %p time(s)", (title, count) => {
    expect(countBrand(title)).toBe(count);
  });
});
