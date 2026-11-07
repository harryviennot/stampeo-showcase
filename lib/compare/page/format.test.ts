import { describe, expect, it } from "bun:test";
import { domainOf, formatDate, headingId, languageList, withoutTrailingColon, withoutTrailingPeriod } from "./format";

describe("the dates a comparison page shows", () => {
  it("reads in the market's language, on the day written, wherever the server runs", () => {
    expect(formatDate("2026-10-05", "us")).toBe("October 5, 2026");
    expect(formatDate("2026-10-05", "fr")).toBe("5 octobre 2026");
    expect(formatDate("2026-01-01", "us")).toBe("January 1, 2026");
  });
});

describe("the domain shown for a source", () => {
  it.each([
    ["https://www.acme-loyalty.example/pricing?plan=starter", "acme-loyalty.example"],
    ["https://help.acme-loyalty.example/articles/1", "help.acme-loyalty.example"],
    ["https://acme-fidelite.example", "acme-fidelite.example"],
  ])("%s is %s, never the raw URL", (url, domain) => {
    expect(domainOf(url)).toBe(domain);
  });
});

describe("the list of languages a page names", () => {
  it.each([
    ["us", "and", "English, Spanish, French and Polish"],
    ["fr", "et", "Français, anglais, espagnol et polonais"],
  ] as const)("on a %s page puts the page's language first and names each in it", (market, and, expected) => {
    expect(languageList(market, ["fr", "en", "es", "pl"], and)).toBe(expected);
  });

  it("follows the codes it is given", () => {
    expect(languageList("us", ["en", "fr"], "and")).toBe("English and French");
    expect(languageList("us", ["en"], "and")).toBe("English");
  });
});

describe("the anchor of a heading a component draws", () => {
  it.each([
    ["Where Loopy Loyalty is stronger", "where-loopy-loyalty-is-stronger"],
    ["Là où Zerosix a l'avantage", "là-où-zerosix-a-lavantage"],
    ["Combien coûtent Fidelatoo et Stampeo\u00a0?", "combien-coûtent-fidelatoo-et-stampeo"],
  ])("%s is #%s, as the page's own headings are", (title, id) => {
    expect(headingId(title)).toBe(id);
  });
});

describe("a label drawn as a title", () => {
  it.each([
    ["Loopy Loyalty:", "Loopy Loyalty"],
    ["Un restaurant dont la caisse est reliée\u00a0:", "Un restaurant dont la caisse est reliée"],
    ["Un restaurant :", "Un restaurant"],
    ["A café: the best", "A café: the best"],
    ["No colon", "No colon"],
  ])("%s loses the colon that introduced what follows", (label, title) => {
    expect(withoutTrailingColon(label)).toBe(title);
  });

  it.each([
    ["Connections to your other tools.", "Connections to your other tools"],
    ["Quatre langues.", "Quatre langues"],
    ["Price, with no caps", "Price, with no caps"],
    ["Version 2.0 and more", "Version 2.0 and more"],
  ])("%s loses its closing full stop", (lead, title) => {
    expect(withoutTrailingPeriod(lead)).toBe(title);
  });
});
