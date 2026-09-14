/**
 * The live price ladder, read from the backend.
 *
 * Prices are Stripe's, resolved by `lookup_key` — see
 * backend/app/services/plan_catalog.py and
 * backend/docs/billing/ADDING_A_CURRENCY.md. Repricing is a Stripe dashboard
 * action; nothing here needs to change and nothing needs to deploy.
 *
 * Server-only: it is fetched in a server component and passed down as a prop,
 * so the currency is fixed at render time and the page stays fully cacheable.
 */

import { FALLBACK_PRICING, type Pricing, type TierId } from "./pricing";

const INTERVALS = ["month", "year"] as const;
const TIERS: TierId[] = ["starter", "growth", "pro"];

/** Matches `ACQUISITION_REVALIDATE_SECONDS`; prices change a few times a year. */
const REVALIDATE_SECONDS = 300;

type PlansResponse = {
  currency: string;
  tiers: Record<string, Record<string, { amount: number }>>;
};

function isCompleteLadder(data: PlansResponse): boolean {
  return TIERS.every((tier) =>
    INTERVALS.every((interval) => typeof data.tiers?.[tier]?.[interval]?.amount === "number"),
  );
}

/**
 * The ladder for one currency, in major units.
 *
 * Falls back to the baked snapshot rather than throwing. A pricing page that
 * renders yesterday's correct price is fine; one that renders nothing, or a
 * zero, costs a signup. The backend has already tried its own last-known-good
 * by the time we see a failure here.
 */
export async function getPlanCatalog(currency: string): Promise<Pricing> {
  const base = process.env.NEXT_PUBLIC_API_URL;
  const fallback = FALLBACK_PRICING[currency] ?? FALLBACK_PRICING.eur;
  if (!base) return fallback;

  try {
    const res = await fetch(`${base}/public/plans?currency=${encodeURIComponent(currency)}`, {
      next: { revalidate: REVALIDATE_SECONDS },
      // Fail fast into the baked ladder. Without this, a backend that is slow
      // rather than down stalls the whole server render behind undici's default
      // timeout, for a fallback that is already sitting right here.
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return fallback;

    const data = (await res.json()) as PlansResponse;
    // A partial ladder would render a tier at zero, which is worse than a stale
    // one. The backend refuses to build an incomplete catalog, so this only
    // fires on a shape change — but it fires silently rather than at a visitor.
    if (!isCompleteLadder(data)) return fallback;

    const tiers = {} as Pricing["tiers"];
    for (const tier of TIERS) {
      tiers[tier] = {
        month: data.tiers[tier].month.amount / 100,
        year: data.tiers[tier].year.amount / 100,
      };
    }
    return { currency: data.currency || currency, tiers };
  } catch {
    return fallback;
  }
}
