import { CardHeroPreview } from "./CardHeroPreview";
import { WalletCard } from "@/components/card/WalletCard";
import { ScaledCardWrapper } from "@/components/card/ScaledCardWrapper";
import { STAMP_SAMPLES, POINTS_SAMPLES } from "@/lib/loyalty-samples";

/**
 * Hero visual: the interactive CardHeroPreview front and center, with two
 * branded sample cards peeking out behind it on large screens. Hints at the
 * style gallery further down without adding any assets or client code.
 */
export function HeroCardStack() {
  const left = POINTS_SAMPLES.find((p) => p.id === "marginalia") ?? POINTS_SAMPLES[0];
  const right = STAMP_SAMPLES.find((s) => s.id === "pulp") ?? STAMP_SAMPLES[0];

  return (
    // Same width/alignment box as CardHeroPreview so the peeking cards are
    // positioned against the hero card itself, not the grid column.
    <div className="relative w-full max-w-[300px] mx-auto lg:ml-auto lg:mr-6">
      {/* Peeking cards: decoration only, desktop only to avoid mobile clutter */}
      <div
        className="hidden lg:block absolute top-1/2 -translate-y-1/2 -left-36 w-[220px] -rotate-[9deg] opacity-70 pointer-events-none select-none"
        aria-hidden="true"
      >
        <ScaledCardWrapper baseWidth={220}>
          <WalletCard
            design={left.design}
            pointsBalance={left.pointsBalance}
            pointsRewards={left.pointsRewards}
            showQR={false}
          />
        </ScaledCardWrapper>
      </div>
      <div
        className="hidden lg:block absolute top-1/2 -translate-y-1/2 -right-24 w-[220px] rotate-[8deg] opacity-70 pointer-events-none select-none"
        aria-hidden="true"
      >
        <ScaledCardWrapper baseWidth={220}>
          <WalletCard design={right.design} stamps={right.stamps} showQR={false} />
        </ScaledCardWrapper>
      </div>

      <div className="relative z-10">
        <CardHeroPreview />
      </div>
    </div>
  );
}
