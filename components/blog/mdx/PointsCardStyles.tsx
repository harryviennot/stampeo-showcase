import { WalletCard } from "@/components/card/WalletCard";
import { ScaledCardWrapper } from "@/components/card/ScaledCardWrapper";
import { POINTS_SAMPLES } from "@/lib/loyalty-samples";
import type { PointsStripStyle } from "@/lib/types/design";

/** One column of the grid: a real points card plus the copy that names it.
 *  `label` and `caption` come from the MDX, not from i18n — the blog engine is
 *  per-language, so the article supplies its own wording. */
export interface PointsCardStyleItem {
  style: PointsStripStyle;
  label: string;
  caption?: string;
}

/**
 * Shows the points balance display styles side by side, rendered with the same
 * <WalletCard> the product and the card-design page use — so a blog post can
 * never drift from what an owner actually gets.
 *
 * Cards come from POINTS_SAMPLES (the hand-designed fictional brands); this
 * picks the first sample matching each requested style. A style with no sample
 * is skipped rather than rendered empty.
 *
 * ```mdx
 * <PointsCardStyles items={[
 *   { style: "big_point", label: "Grand chiffre", caption: "..." },
 * ]} />
 * ```
 */
export function PointsCardStyles({ items }: { items: PointsCardStyleItem[] }) {
  const resolved = items
    .map((item) => ({
      item,
      sample: POINTS_SAMPLES.find(
        (s) => s.design.points_strip_style === item.style
      ),
    }))
    .filter(
      (entry): entry is typeof entry & { sample: (typeof POINTS_SAMPLES)[number] } =>
        Boolean(entry.sample)
    );

  if (resolved.length === 0) return null;

  return (
    <div className="not-prose my-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {resolved.map(({ item, sample }) => (
        <figure key={item.style} className="flex flex-col items-center gap-3">
          <div className="w-full max-w-[260px]">
            <ScaledCardWrapper baseWidth={280}>
              <WalletCard
                design={sample.design}
                pointsBalance={sample.pointsBalance}
                pointsRewards={sample.pointsRewards}
                showQR={false}
              />
            </ScaledCardWrapper>
          </div>
          <figcaption className="text-center">
            <span className="block text-sm font-bold text-[var(--near-black)]">
              {item.label}
            </span>
            {item.caption ? (
              <span className="mt-1 block text-sm text-[var(--muted-foreground)]">
                {item.caption}
              </span>
            ) : null}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
