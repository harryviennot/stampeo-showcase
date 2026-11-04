import { describe, expect, it } from "bun:test";
import { domainOf, formatDate } from "./format";

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
