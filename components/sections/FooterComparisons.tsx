import type { FooterComparison } from "@/lib/compare/footer";
import type { Market } from "@/lib/markets";
import { MarketLink } from "../market/MarketLink";

/** The footer's comparison links under a small label. Nothing while there is no title or no published comparison. */
export function FooterComparisons({
  market,
  title,
  comparisons,
}: Readonly<{ market: Market; title: string | null; comparisons: readonly FooterComparison[] }>) {
  if (!title || comparisons.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 pt-2">
      <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">{title}</p>
      <nav aria-label={title} className="flex flex-col gap-3">
        {comparisons.map(({ href, label }) => (
          <MarketLink
            key={href}
            market={market}
            href={href}
            className="text-white/60 hover:text-[var(--accent)] transition-colors text-sm font-medium"
          >
            {label}
          </MarketLink>
        ))}
      </nav>
    </div>
  );
}
