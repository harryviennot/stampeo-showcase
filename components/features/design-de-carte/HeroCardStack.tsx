import { getTranslations } from "next-intl/server";
import { WalletCard } from "@/components/card/WalletCard";
import { ScaledCardWrapper } from "@/components/card/ScaledCardWrapper";
import { STAMP_SAMPLES, POINTS_SAMPLES } from "@/lib/loyalty-samples";

/**
 * Hero visual built entirely from the hand-designed brand bank: the Aurevo
 * café card (real imported cup icons) front and center, with two points cards
 * peeking out behind it on large screens.
 */
export async function HeroCardStack() {
  const tp = await getTranslations("features.design-de-carte.custom.playground");

  const center = STAMP_SAMPLES.find((s) => s.id === "aurevo") ?? STAMP_SAMPLES[0];
  const left = POINTS_SAMPLES.find((p) => p.id === "salon") ?? POINTS_SAMPLES[0];
  const right = POINTS_SAMPLES.find((p) => p.id === "marginalia") ?? POINTS_SAMPLES[0];

  const centerDesign = {
    ...center.design,
    secondary_fields: [
      { key: "member", label: tp("memberLabel"), value: tp("memberName") },
      { key: "reward", label: tp("rewardLabel"), value: tp("rewardValue") },
    ],
  };

  return (
    // Fixed-width box so the peeking cards are positioned against the hero
    // card itself, not the grid column.
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
          <WalletCard
            design={right.design}
            pointsBalance={right.pointsBalance}
            pointsRewards={right.pointsRewards}
            showQR={false}
          />
        </ScaledCardWrapper>
      </div>

      <div className="relative z-10">
        <ScaledCardWrapper baseWidth={300}>
          <WalletCard
            design={centerDesign}
            stamps={center.stamps}
            showQR={false}
            interactive3D
          />
        </ScaledCardWrapper>
      </div>
    </div>
  );
}
