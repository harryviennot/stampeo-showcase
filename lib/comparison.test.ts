import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { MARKETS, type Market } from "./markets";

/**
 * The US comparison table names three competitors by name.
 *
 * In the US that is lawful advertising as long as every claim is truthful and
 * substantiated, which puts a different kind of weight on these strings than on
 * the rest of the site: a cell that goes out of date does not become merely
 * stale, it becomes a false statement about another company. So the shape is
 * enforced here rather than trusted — no blank cells, no ragged rows, and a
 * verification date that has to be updated when the claims are rechecked.
 */

type Row = { label: string; us: string; values: string[]; note?: string; noteFor?: string };
type Comparison = {
  title: string;
  subtitle: string;
  verified: string;
  us: string;
  columns: string[];
  rows: Row[];
};

function marketComparison(market: Market): Comparison | undefined {
  const landing = JSON.parse(
    readFileSync(join(import.meta.dir, "..", "messages", "en", "landing.json"), "utf8"),
  );
  return landing.variant?.[market]?.comparison;
}

const us = marketComparison("us");

describe("the comparison table is US-only", () => {
  test("/us has one", () => {
    expect(us).toBeDefined();
  });

  test("no other market does", () => {
    // It resolves through `marketCopy`, so a `variant.<market>.comparison`
    // subtree is the only thing that can make it render. /en inheriting this
    // table would put competitor claims in front of markets we never checked
    // them against.
    for (const market of Object.keys(MARKETS) as Market[]) {
      if (market === "us") continue;
      expect(marketComparison(market)).toBeUndefined();
    }
  });
});

describe("comparison table shape", () => {
  test("every row is as wide as the column header", () => {
    // A short row renders a table with a missing cell, which reads as "no".
    for (const row of us!.rows) {
      expect(row.values).toHaveLength(us!.columns.length);
    }
  });

  test("no cell is blank", () => {
    const blanks: string[] = [];
    for (const row of us!.rows) {
      if (!row.us.trim()) blanks.push(`"${row.label}" has no value for us`);
      row.values.forEach((v, i) => {
        if (!v.trim()) blanks.push(`"${row.label}" has no value for ${us!.columns[i]}`);
      });
    }
    expect(blanks).toEqual([]);
  });

  test("it names the three competitors a US buyer actually shortlists", () => {
    expect(us!.columns).toEqual(["Square Loyalty", "Loopy Loyalty", "Stamp Me"]);
  });

  test("a note that names a column names one that exists", () => {
    // `noteFor` decides whether the note renders on mobile. A typo silently
    // hides the sentence that substantiates the claim, on the 90% of traffic
    // that is on a phone, and nothing else would catch it.
    const wrong = us!.rows
      .filter((r) => r.noteFor && !us!.columns.includes(r.noteFor))
      .map((r) => `"${r.label}" points its note at "${r.noteFor}", which is not a column`);
    expect(wrong).toEqual([]);
  });

  test("a note about one competitor says which", () => {
    // Otherwise it shows under every comparison on mobile, including the ones
    // it is not about.
    // Notes use the brand as people say it ("Square", "Loopy"), not the full
    // column heading, so match on the distinctive part. Case-sensitive, so
    // "stamp cards" in prose is not read as Stamp Me.
    const brand = (column: string) =>
      new RegExp(`\\b${column === "Stamp Me" ? "Stamp Me" : column.split(" ")[0]}\\b`);
    const unscoped = us!.rows
      .filter((r) => r.note && !r.noteFor)
      .filter((r) => us!.columns.filter((c) => brand(c).test(r.note!)).length === 1)
      .map((r) => `"${r.label}" names one competitor in its note but has no noteFor`);
    expect(unscoped).toEqual([]);
  });

  test("it carries a verification date", () => {
    // The claims are about other companies and they change. A table without a
    // date is a table nobody knows to recheck.
    expect(us!.verified).toMatch(/\b20\d{2}\b/);
  });

  test("Stampeo is the only column with no gap", () => {
    // If this fails, either a competitor caught up or we lost something. Both
    // are worth knowing before the page ships, and neither should be discovered
    // by a reader.
    const isGap = (v: string) => /^(no|required|not sold)$/i.test(v.trim());
    expect(us!.rows.filter((r) => isGap(r.us))).toEqual([]);
    const competitorGaps = us!.columns.map((_, i) =>
      us!.rows.filter((r) => isGap(r.values[i])).length,
    );
    for (const gaps of competitorGaps) expect(gaps).toBeGreaterThan(0);
  });

  test("the price question is asked twice, and the second one is the argument", () => {
    // A single entry-price row loses to anyone cheaper: Loopy at $25 ticks all
    // but one box, so on that row alone the table argues for Loopy. The second
    // row is the honest rebuttal — their cheaper plan does not become ours at
    // any price, because the gap is capability, not tier.
    const rows = us!.rows.map((r) => r.label.toLowerCase());
    expect(rows).toContain("starts at");
    expect(rows).toContain("price for everything above");
    const everything = us!.rows.find((r) => r.label === "Price for everything above")!;
    expect(everything.us).toContain("{starterPrice}");
    for (const v of everything.values) expect(v).toMatch(/^not sold$/i);
  });

  test("the claims that justify the table are present", () => {
    // Each of these is the verified fact that makes a row worth printing.
    // Losing one silently would leave a table that argues nothing.
    const find = (needle: string) =>
      us!.rows.find((r) => r.label.toLowerCase().includes(needle));

    // Square offers Apple Wallet only; this is the sharpest true claim we have.
    expect(find("google wallet")!.values[0]).toMatch(/^no$/i);
    // Square is points-only, Loopy is stamps-only.
    expect(find("stamp cards")!.values[0]).toMatch(/^no$/i);
    expect(find("points")!.values[1]).toMatch(/^no$/i);
    // Stamp Me makes the customer install an app.
    expect(find("app for your customers")!.values[2]).toMatch(/^required$/i);
    // Square requires its own POS.
    expect(find("pos")!.values[0]).toMatch(/^no$/i);
  });
});
