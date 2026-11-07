import { describe, expect, it } from "bun:test";
import { factsReadOn } from "./build";

describe("the fact builder", () => {
  const fact = factsReadOn("2026-11-04");
  const PRICING = { sourceUrl: "https://acme.example/pricing", sourceTitle: "Acme pricing" };

  it("builds a sourced fact: its value, the page it was read on, the words it rests on, and the day it was read", () => {
    expect(fact(PRICING, "price.entry", "$25 a month", '"$25 / mo"')).toEqual({
      id: "price.entry",
      value: "$25 a month",
      sourceUrl: "https://acme.example/pricing",
      sourceTitle: "Acme pricing",
      quote: '"$25 / mo"',
      checkedAt: "2026-11-04",
    });
  });

  it("carries the at-a-glance value the table shows, when one is given", () => {
    expect(fact(PRICING, "price.entry", "Starter, $25 a month, billed monthly", '"$25 / mo"', "$25/mo").short).toBe("$25/mo");
    expect(fact(PRICING, "price.entry", "$25 a month", '"$25 / mo"')).not.toHaveProperty("short");
  });

  it("dates every fact of a reading session the same day", () => {
    expect(fact(PRICING, "trial", "7-day free trial", "q").checkedAt).toBe(fact(PRICING, "commitment", "None", "q").checkedAt);
  });
});
