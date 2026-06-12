"use client";

import { useTranslations } from "next-intl";
import { ScaledCardWrapper } from "@/components/card/ScaledCardWrapper";
import { WalletCard } from "@/components/card/WalletCard";
import type { CardDesign } from "@/lib/types/design";

/**
 * Compact, non-interactive hero card. The full interactive designer lives in
 * its own section lower on the page so the hero stays tight.
 */
export function CardHeroPreview() {
  const t = useTranslations("features.design-de-carte.custom.playground");
  const themes = t.raw("themes") as Array<{ name: string; orgName: string }>;

  const design: Partial<CardDesign> = {
    organization_name: themes[0].orgName,
    background_color: "#1c1c1e",
    stamp_filled_color: "#f97316",
    icon_color: "#ffffff",
    stamp_icon: "coffee",
    reward_icon: "gift",
    total_stamps: 8,
    secondary_fields: [
      { key: "member", label: t("memberLabel"), value: t("memberName") },
      { key: "reward", label: t("rewardLabel"), value: t("rewardValue") },
    ],
  };

  return (
    <div className="w-full max-w-[300px] mx-auto lg:ml-auto lg:mr-0">
      <ScaledCardWrapper baseWidth={300}>
        <WalletCard design={design} stamps={5} showQR={false} interactive3D />
      </ScaledCardWrapper>
    </div>
  );
}
