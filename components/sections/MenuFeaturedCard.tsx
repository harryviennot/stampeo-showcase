"use client";

import { WalletCard } from "@/components/card/WalletCard";
import { AUREVO } from "@/components/landing-pages/shared/samples";
import { PassFrame } from "@/components/landing-pages/shared/PassFrame";

/** The top of Aurevo's card (its name, count and stamps), on a plate the size of a thumbnail: the drill-down's featured tile. */
export default function MenuFeaturedCard() {
  return (
    <div aria-hidden className="h-[72px] w-[100px] shrink-0 overflow-hidden rounded-xl ring-1 ring-black/10">
      <PassFrame width={100}>
        <WalletCard design={AUREVO.design} stamps={5} showQR={false} />
      </PassFrame>
    </div>
  );
}
