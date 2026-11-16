import { ScaledCardWrapper } from "@/components/card/ScaledCardWrapper";
import { WalletCard } from "@/components/card/WalletCard";
import { ScaledBox } from "@/components/ui/ScaledBox";
import type { PublicLevel } from "@/lib/levels/levels";
import { WRENFOLD } from "../../shared/samples";
import { SignupStrip } from "./SignupStrip";

/** The dry cleaner's ladder as the sign-up page's backend publishes it; Silver and Gold match the Scanner preview. */
const LADDER: PublicLevel[] = [
  { rank: 1, name: "Bronze", total_stamps: 8, reward_name: "Free shirt press", advance: { fills: 1 }, perks: [] },
  {
    rank: 2,
    name: "Silver",
    total_stamps: 6,
    reward_name: "Free shirt press",
    advance: { fills: 2 },
    perks: ["Free hanger return", "Priority pickup"],
  },
  {
    rank: 3,
    name: "Gold",
    total_stamps: 5,
    reward_name: "Free duvet clean",
    advance: null,
    perks: ["10% off every order", "Free pickup and delivery"],
  },
];

/** Bronze is the shop's own white card, with the 8 stamps the ladder gives it. */
const BRONZE_CARD = { ...WRENFOLD.design, total_stamps: 8 };

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
