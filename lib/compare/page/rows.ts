import { marketFacts } from "../facts";
import type { StampeoColumn } from "../stampeo";
import { STANDARD_FACT_IDS, type CompetitorFacts, type Market, type StandardFactId } from "../types";
import { COPY } from "./copy";

/** How a cell reads at a glance: an affirmative, a negative, or just text. */
export type Tone = "yes" | "no" | "plain";

export interface Cell {
  text: string;
  tone: Tone;
}

export interface TableRow {
  id: StandardFactId;
  label: string;
  /** The price row shows its period and tax basis in the text of both cells. */
  price: boolean;
  competitor: Cell;
  stampeo: Cell;
}

export interface TableInput {
  market: Market;
  competitor: CompetitorFacts;
  stampeo: StampeoColumn;
}

// A cell opens with its answer when it has one; "Not published" and "Non communiqué" are neither.
const YES: Record<Market, RegExp> = { us: /^yes\b/i, fr: /^oui\b/i };
const NO: Record<Market, RegExp> = {
  us: /^(?:no|none)\b/i,
  fr: /^(?:aucune?\b|non(?=\s*[,.:;!]|\s*$))/i,
};

export function cellOf(text: string, market: Market): Cell {
  if (YES[market].test(text)) return { text, tone: "yes" };
  if (NO[market].test(text)) return { text, tone: "no" };
  return { text, tone: "plain" };
}

// Rows where "none" is the answer a shop wants: a minus icon would read as a gap.
const PLAIN_ROWS: ReadonlySet<StandardFactId> = new Set(["customer.app_required"]);

const cellFor = (id: StandardFactId, text: string, market: Market): Cell =>
  PLAIN_ROWS.has(id) ? { text, tone: "plain" } : cellOf(text, market);

const TTC_RATE = 1.2;
const HT_AMOUNT = /(\d+(?:[.,]\d+)?)\s*(?:€|euros?)\s*HT\b/gi;

const euros = (amount: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);

/**
 * A competitor's value as the page shows it. On a French page an amount quoted
 * HT is followed by its TTC equivalent at 20 %, so a shop that pays VAT and
 * one that recovers it can both compare; every other value is left as published.
 */
export function competitorText(value: string, market: Market): string {
  const note = COPY[market].ttcEquivalent;
  if (!note || /\bTTC\b/i.test(value)) return value;

  return value.replace(HT_AMOUNT, (published, amount: string) => {
    const ttc = Math.round(Number.parseFloat(amount.replace(",", ".")) * TTC_RATE * 100) / 100;
    return `${published} (${note(euros(ttc))})`;
  });
}

/** The standard rows the competitor has a sourced fact for, in the standard order, beside Stampeo's value for each. */
export function tableRows({ market, competitor, stampeo }: TableInput): TableRow[] {
  const facts = new Map(marketFacts(competitor, market).map((fact) => [fact.id, fact]));
  const labels = COPY[market].rowLabels;

  return STANDARD_FACT_IDS.flatMap((id) => {
    const fact = facts.get(id);
    if (!fact) return [];
    return [
      {
        id,
        label: labels[id],
        price: id === "price.entry",
        competitor: cellFor(id, competitorText(fact.value, market), market),
        stampeo: cellFor(id, stampeo.rows[id], market),
      },
    ];
  });
}
