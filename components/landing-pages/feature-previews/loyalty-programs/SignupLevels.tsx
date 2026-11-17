import { ScaledCardWrapper } from "@/components/card/ScaledCardWrapper";
import { WalletCard } from "@/components/card/WalletCard";
import { ScaledBox } from "@/components/ui/ScaledBox";
import type { PublicLevel } from "@/lib/levels/levels";
import { LADDER_CARDS } from "@/lib/landing-pages/previews/loyalty-ladder";
import { SignupStrip } from "./SignupStrip";

/** The barbershop's ladder as the sign-up page's backend publishes it, the same as the levels section's. */
const LADDER: PublicLevel[] = [
  { rank: 1, name: "Bronze", total_stamps: 6, reward_name: "Free haircut", advance: { fills: 1 }, perks: [] },
  {
    rank: 2,
    name: "Silver",
    total_stamps: 5,
    reward_name: "Free haircut",
    advance: { fills: 2 },
    perks: ["Free hot towel finish"],
  },
  {
    rank: 3,
    name: "Gold",
    total_stamps: 4,
    reward_name: "Haircut and beard trim",
    advance: null,
    perks: ["Free beard trim", "Priority booking"],
  },
];

/** Bronze is the shop's own white card, with the 6 stamps the ladder gives it. */
const BRONZE_CARD = LADDER_CARDS[0].design;

/** A card is laid out 300px wide and cut at 227px, its header and stamps, shown 168px wide. */
const CARD = { width: 300, cut: 227, shown: 168 } as const;

/** What a new customer sees on the sign-up page: their first card, and under it the real levels strip. */
export function SignupLevels() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-4 text-left">
      <ScaledBox width={CARD.width} height={CARD.cut} to={CARD.shown}>
        <div className="h-full overflow-hidden rounded-[18px] shadow-[0_8px_20px_-10px_rgba(25,18,16,0.35)]">
          <ScaledCardWrapper baseWidth={CARD.width}>
            <WalletCard design={BRONZE_CARD} stamps={3} showQR={false} showSecondaryFields={false} headerLabel="Bronze" />
          </ScaledCardWrapper>
        </div>
      </ScaledBox>
      <SignupStrip levels={LADDER} />
    </div>
  );
}
