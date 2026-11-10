import type { FooterComparison } from "@/lib/compare/footer";
import type { Market } from "@/lib/markets";
import { MarketLink } from "../market/MarketLink";
import { FooterColumn } from "./FooterColumn";

/** The footer's column of comparison links. Nothing while there is no title or no published comparison. */
export function FooterComparisons({
  market,
  title,
  comparisons,
}: Readonly<{ market: Market; title: string | null; comparisons: readonly FooterComparison[] }>) {
  if (!title || comparisons.length === 0) return null;

  return (
    <FooterColumn title={title}>
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
    </FooterColumn>
  );
}
