import { getTranslations } from "next-intl/server";
import { ScrollReveal } from "../ui/ScrollReveal";
import { marketCopy } from "@/lib/market-copy";
import { type Market } from "@/lib/markets";
import { interpolatePricing, type Pricing } from "@/lib/pricing";
import { ComparisonTable, type ComparisonRow } from "./ComparisonTable";

/**
 * The US comparison table.
 *
 * Only 1 of 9 US competitors puts one on their landing page, and it is the only
 * thing that sets the price frame: read cold, our $49 is twice Loopy's $25;
 * read against Square's $45 *per location* plus $15 for messaging, it is half.
 *
 * It renders where `variant.<market>.comparison` exists, which today is /us
 * alone. That is deliberate and enforced in lib/comparison.test.ts: the cells
 * name three companies, and a claim verified for the US market is not a claim
 * we have checked anywhere else.
 *
 * Our own cells interpolate {starterPrice} from the live catalog. The
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

  const rows = (copy.raw("comparison.rows") as ComparisonRow[]).map((row) => ({
    ...row,
    us: interpolatePricing(row.us, pricing, locale),
  }));

  return (
    <section
      data-landing-section="comparison"
      className="relative py-16 lg:py-24 bg-[var(--blog-bg-alt)]"
    >
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="flex flex-col items-center text-center mb-10 lg:mb-12 gap-4">
          <h2 className="text-h2 max-w-3xl">{copy.t("comparison.title")}</h2>
          <p className="text-lead text-[var(--muted-foreground)] max-w-2xl">
            {copy.t("comparison.subtitle")}
          </p>
        </ScrollReveal>

        <ComparisonTable
          usLabel={copy.t("comparison.us")}
          columns={copy.raw("comparison.columns") as string[]}
          rows={rows}
        />

        <p className="mt-5 text-sm text-[var(--muted-foreground)] text-center">
          {copy.t("comparison.verified")}
        </p>
      </div>
    </section>
  );
}
