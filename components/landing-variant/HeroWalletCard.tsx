"use client";

import { WalletCard } from "../card/WalletCard";
import { ScaledCardWrapper } from "../card/ScaledCardWrapper";
import { STAMPEO_LOGO } from "@/lib/stampeo-card";
import { useStampFillOnView } from "@/hooks/useStampFillOnView";

const FILLED_STAMPS = 5;

/**
 * The hero card. Its stamps fill in one by one the first time it comes into
 * view, which is the product in one gesture. The real interactive demo lives
 * further down the page in its own section.
 */
export function HeroWalletCard({
  organizationName,
  rewardLabel,
  rewardText,
}: Readonly<{
  organizationName: string;
  rewardLabel: string;
  rewardText: string;
}>) {
  const { ref, stamps } = useStampFillOnView(FILLED_STAMPS);

  return (
    <div ref={ref} className="w-full max-w-[340px]">
      <ScaledCardWrapper size="lg">
        <WalletCard
          design={{
            organization_name: organizationName,
            total_stamps: 8,
            background_color: "#1c1c1e",
            stamp_filled_color: "#f97316",
            label_color: "#fff",
            logo_url: STAMPEO_LOGO,
            secondary_fields: [
              { key: "reward", label: rewardLabel, value: rewardText },
            ],
          }}
          stamps={stamps}
          showQR={false}
          interactive3D
        />
      </ScaledCardWrapper>
    </div>
  );
}
