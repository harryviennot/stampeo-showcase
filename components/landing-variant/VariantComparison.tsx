import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "../ui/ScrollReveal";
import { CheckIcon } from "../icons";
import { marketCopy } from "@/lib/market-copy";
import { type Market } from "@/lib/markets";
import { interpolatePricing, type Pricing } from "@/lib/pricing";

type Row = { label: string; us: string; values: string[]; note?: string };

/**
 * The US comparison table.
 *
 * Only 1 of 9 US competitors puts one on their landing page, and it is the only
 * thing that sets the price frame: read cold, $49 is twice Loopy's $25; read
 * next to Square's $45 *per location* plus $15 for messaging, it is half.
 *
 * It renders where `variant.<market>.comparison` exists, which today is /us
 * alone. That is deliberate and enforced in lib/comparison.test.ts: the cells
 * name three companies, and a claim we verified for the US market is not a
 * claim we have checked anywhere else.
 *
 * Our own price cell interpolates {starterPrice} from the live catalog. The
 * competitor cells are literal on purpose — they are facts about other
 * companies, and running them through the pricing interpolator would restate
 * Square's number as ours.
 */
export async function VariantComparison({
  market,
  pricing,
  locale,
}: Readonly<{ market: Market; pricing: Pricing; locale: string }>) {
  const t = await getTranslations("variant");
  const copy = marketCopy(t, market);
  if (!copy.has("comparison.rows")) return null;

  const columns = copy.raw("comparison.columns") as string[];
  const rows = copy.raw("comparison.rows") as Row[];
  const usLabel = copy.t("comparison.us");

  return (
    <section data-landing-section="comparison" className="relative py-16 lg:py-24 bg-[var(--blog-bg-alt)]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="flex flex-col items-center text-center mb-10 gap-4">
          <h2 className="text-h2 max-w-3xl">{copy.t("comparison.title")}</h2>
          <p className="text-lead text-[var(--muted-foreground)] max-w-2xl">
            {copy.t("comparison.subtitle")}
          </p>
        </ScrollReveal>

        {/* The table is wider than a phone. It scrolls inside its own box so the
            page body never scrolls sideways. */}
        <ScrollReveal delay={150} className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[640px] border-collapse bg-white rounded-2xl overflow-hidden card-stamp">
            <caption className="sr-only">{copy.t("comparison.title")}</caption>
            <thead>
              <tr>
                <th scope="col" className="text-left p-4 md:p-5 text-sm font-semibold text-[var(--muted-foreground)]">
                  <span className="sr-only">Feature</span>
                </th>
                <th scope="col" className="p-4 md:p-5 text-sm font-bold text-[var(--accent)] bg-[var(--accent)]/8 whitespace-nowrap">
                  {usLabel}
                </th>
                {columns.map((name) => (
                  <th
                    key={name}
                    scope="col"
                    className="p-4 md:p-5 text-sm font-semibold text-[var(--muted-foreground)] whitespace-nowrap"
                  >
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-[var(--border)]">
                  <th scope="row" className="text-left p-4 md:p-5 align-top">
                    <span className="text-base font-semibold">{row.label}</span>
                    {row.note && (
                      <span className="block mt-1 text-sm font-normal text-[var(--muted-foreground)] max-w-xs">
                        {row.note}
                      </span>
                    )}
                  </th>
                  <td className="p-4 md:p-5 text-center align-top bg-[var(--accent)]/8">
                    <Cell value={interpolatePricing(row.us, pricing, locale)} emphasis />
                  </td>
                  {row.values.map((value, i) => (
                    <td key={columns[i]} className="p-4 md:p-5 text-center align-top">
                      <Cell value={value} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </ScrollReveal>

        <p className="mt-5 text-sm text-[var(--muted-foreground)] text-center">
          {copy.t("comparison.verified")}
        </p>
      </div>
    </section>
  );
}

/**
 * "Yes" becomes a tick and "No" a dash, because a column of ticks is read at a
 * glance where a column of the word "Yes" is read word by word. Anything else
 * is a real answer ("Required", a price) and prints as written.
 */
function Cell({ value, emphasis = false }: Readonly<{ value: string; emphasis?: boolean }>) {
  if (/^yes$/i.test(value)) {
    return (
      <>
        <CheckIcon
          weight="bold"
          aria-hidden
          className={`inline-block w-5 h-5 ${emphasis ? "text-[var(--accent)]" : "text-[var(--foreground)]"}`}
        />
        <span className="sr-only">{value}</span>
      </>
    );
  }
  if (/^no$/i.test(value)) {
    return (
      <>
        <span aria-hidden className="text-[var(--muted-foreground)] text-lg leading-none">–</span>
        <span className="sr-only">{value}</span>
      </>
    );
  }
  return (
    <span className={`text-sm ${emphasis ? "font-semibold text-[var(--accent)]" : "text-[var(--muted-foreground)]"}`}>
      {value}
    </span>
  );
}
