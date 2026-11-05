import { describe, expect, it } from "bun:test";
import { pageSetup } from "./setup";

describe("what a comparison page is set up with", () => {
  it.each([
    ["us", "us", "usd"],
    ["fr", "int", "eur"],
  ] as const)("the %s page wears the %s header and footer and reads the catalog in %s", (market, siteMarket, currency) => {
    expect(pageSetup(market)).toEqual({ siteMarket, currency });
  });
});
