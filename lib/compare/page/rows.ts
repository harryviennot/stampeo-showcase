import { marketFacts } from "../facts";
import type { StampeoColumn } from "../stampeo";
import type { CompetitorFacts, Market, RowGroupId, SourcedFact, StandardFactId } from "../types";
import { COPY } from "./copy";

/** One product's side of a table row. */
export interface Side {
  /** The at-a-glance answer. */
  short: string;
  /** The line under the price: the TTC equivalent of an HT price, or Stampeo's "TVA non applicable". */
  taxLine: string | null;
}

export interface TableRow {
  id: StandardFactId;
  label: string;
  competitor: Side;
  stampeo: Side;
}

export interface TableGroup {
  id: RowGroupId;
  label: string;
  rows: TableRow[];
}

export interface TableInput {
  market: Market;
  competitor: CompetitorFacts;
  stampeo: StampeoColumn;
}

/**
 * The four themes the rows are grouped under, in display order, each with its
 * rows in display order. `languages` is a standard fact but no row: a facts
 * file may keep it, the table never shows it.
 */
export const ROW_GROUPS: ReadonlyArray<{ id: RowGroupId; rows: readonly StandardFactId[] }> = [
  { id: "customer", rows: ["card.where", "customer.app_required"] },
  { id: "program", rows: ["program.types", "designer", "push.automatic", "push.broadcasts"] },
  { id: "counter", rows: ["staff.scanning", "pos.integration", "locations.multiple", "export"] },
  { id: "price", rows: ["price.entry", "trial", "commitment"] },
];

/** The fact ids the table shows, in display order. */
export const TABLE_FACT_IDS: readonly StandardFactId[] = ROW_GROUPS.flatMap((group) => group.rows);

const TTC_RATE = 1.2;
// An amount whose thousands may be separated by a space, a no-break space or a narrow no-break space.
const HT_AMOUNT = /(\d{1,3}(?:[ \u00a0\u202f]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?)\s*(?:€|euros?)\s*HT\b/gi;

const euros = (amount: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);

/** The TTC price of an HT amount written as the source writes it ("1 234,50"), in euros. */
function ttcOf(amount: string): string {
  const ht = Number.parseFloat(amount.replace(/[ \u00a0\u202f]/g, "").replace(",", "."));
  return euros(Math.round(ht * TTC_RATE * 100) / 100);
}

/**
 * A competitor's value as the page shows it. On a French page an amount quoted
 * HT is followed by its TTC equivalent at 20 %, so a shop that pays VAT and
 * one that recovers it can both compare; every other value is left as published.
 */
export function competitorText(value: string, market: Market): string {
  const note = COPY[market].ttcEquivalent;
  if (!note || /\bTTC\b/i.test(value)) return value;

  return value.replace(HT_AMOUNT, (published, amount: string) => `${published} (${note(ttcOf(amount))})`);
}

/** The TTC equivalent of every HT amount in a price, as one line; null when there is no HT amount to convert. */
function taxLineOf(price: string, market: Market): string | null {
  const note = COPY[market].ttcEquivalent;
  if (!note || /\bTTC\b/i.test(price)) return null;

  const ttc = [...price.matchAll(HT_AMOUNT)].map((match) => ttcOf(match[1]));
  return ttc.length > 0 ? note(ttc.join(" / ")) : null;
}

/** The competitor's short value, or its full value while the fact has none. */
function competitorSide(fact: SourcedFact, market: Market, price: boolean): Side {
  if (fact.short === undefined) return { short: competitorText(fact.value, market), taxLine: null };
  return { short: fact.short, taxLine: price ? taxLineOf(fact.short, market) : null };
}

const stampeoSide = (column: StampeoColumn, id: StandardFactId): Side => ({
  short: column.rowsShort[id],
  taxLine: id === "price.entry" ? column.taxNote : null,
});

/** The table's rows by theme: the standard rows the competitor has a sourced fact for, beside Stampeo's value for each. A theme with no row is left out. */
export function tableGroups({ market, competitor, stampeo }: TableInput): TableGroup[] {
  const facts = new Map(marketFacts(competitor, market).map((fact) => [fact.id, fact]));
  const copy = COPY[market];

  return ROW_GROUPS.flatMap((group) => {
    const rows = group.rows.flatMap((id): TableRow[] => {
      const fact = facts.get(id);
      if (!fact) return [];
      return [
        {
          id,
          label: copy.rowLabels[id],
          competitor: competitorSide(fact, market, id === "price.entry"),
          stampeo: stampeoSide(stampeo, id),
        },
      ];
    });
    return rows.length > 0 ? [{ id: group.id, label: copy.groupLabels[group.id], rows }] : [];
  });
}
