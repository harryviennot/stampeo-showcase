import { describe, expect, it } from "bun:test";
import { ACME_FIDELITE, ACME_LOYALTY } from "../__fixtures__";
import { usedFacts } from "../checked";
import type { SourcedFact } from "../types";
import { sourceEntries } from "./sources";

const fact = (id: string, sourceUrl: string, sourceTitle: string, checkedAt: string): SourcedFact => ({
  id,
  value: "v",
  sourceUrl,
  sourceTitle,
  quote: "q",
  checkedAt,
});

describe("the sources a page lists", () => {
  it("name each page once, with its title, its domain and the day it was read", () => {
    const entries = sourceEntries([
      fact("price.entry", "https://www.acme.example/pricing", "Acme pricing", "2026-11-01"),
      fact("card.where", "https://www.acme.example/how-it-works", "How Acme works", "2026-10-20"),
    ]);

    expect(entries).toEqual([
      { url: "https://www.acme.example/pricing", title: "Acme pricing", domain: "acme.example", checkedAt: "2026-11-01" },
      { url: "https://www.acme.example/how-it-works", title: "How Acme works", domain: "acme.example", checkedAt: "2026-10-20" },
    ]);
  });

  it("collapse facts read from the same page, keeping the oldest reading so the page never looks fresher than it is", () => {
    const entries = sourceEntries([
      fact("price.entry", "https://acme.example/pricing", "Acme pricing", "2026-11-01"),
      fact("trial", "https://acme.example/pricing", "Acme pricing", "2026-10-05"),
      fact("commitment", "https://acme.example/pricing", "Acme pricing", "2026-10-28"),
    ]);

    expect(entries).toHaveLength(1);
    expect(entries[0].checkedAt).toBe("2026-10-05");
  });

  it("are built from the facts the checked date counts: the standard rows, plus the facts the prose cites", () => {
    const ids = (content: string) => usedFacts({ market: "us", content }, ACME_LOYALTY).map((used) => used.id);

    expect(ids("No facts in the prose.")).toEqual(["card.where", "customer.app_required", "price.entry", "trial"]);
    expect(ids('See <Fact id="support.hours" />.')).toContain("support.hours");
  });

  it("read the French facts of a French page", () => {
    const entries = sourceEntries(usedFacts({ market: "fr", content: "" }, ACME_FIDELITE));
    expect(entries.map((entry) => entry.domain)).toEqual(["acme-fidelite.example"]);
    expect(entries).toHaveLength(2);
  });
});
