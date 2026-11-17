import { ScaledCardWrapper } from "@/components/card/ScaledCardWrapper";
import { WalletCard } from "@/components/card/WalletCard";
import { ScaledBox } from "@/components/ui/ScaledBox";
import { useLandingCopy } from "@/lib/landing-pages/copy/bundle";
import type { PublicLevel } from "@/lib/levels/levels";
import { ladderCards } from "@/lib/landing-pages/previews/loyalty-ladder";
import { SignupStrip } from "./SignupStrip";

/** A card is laid out 300px wide and cut at 227px, its header and stamps, shown 168px wide. */
const CARD = { width: 300, cut: 227, shown: 168 } as const;

/** What a new customer sees on the sign-up page: their first card, and under it the real levels strip. */
export function SignupLevels() {
  const { levels } = useLandingCopy().previews.loyaltyPrograms.LOYALTY_PROGRAMS_PREVIEW;
  const [bronze, silver, gold] = levels.ladder;
  // Bronze is the shop's own white card, with the 6 stamps the ladder gives it.
  const bronzeCard = ladderCards(levels.member)[0].design;
  /** The barbershop's ladder as the sign-up page's backend publishes it, the same as the levels section's. */
  const ladder: PublicLevel[] = [
    { rank: 1, name: bronze.name, total_stamps: 6, reward_name: bronze.rewardName, advance: { fills: 1 }, perks: [...bronze.perks] },
    { rank: 2, name: silver.name, total_stamps: 5, reward_name: silver.rewardName, advance: { fills: 2 }, perks: [...silver.perks] },
    { rank: 3, name: gold.name, total_stamps: 4, reward_name: gold.rewardName, advance: null, perks: [...gold.perks] },
  ];

  return (
    <div className="flex h-full flex-col items-center justify-center px-4 text-left">
      <ScaledBox width={CARD.width} height={CARD.cut} to={CARD.shown}>
        <div className="h-full overflow-hidden rounded-[18px] shadow-[0_8px_20px_-10px_rgba(25,18,16,0.35)]">
          <ScaledCardWrapper baseWidth={CARD.width}>
            <WalletCard design={bronzeCard} stamps={3} showQR={false} showSecondaryFields={false} headerLabel={bronze.name} />
          </ScaledCardWrapper>
        </div>
      </ScaledBox>
      <SignupStrip levels={ladder} />
    </div>
  );
}
