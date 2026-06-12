"use client";

import { useTranslations } from "next-intl";
import { ScaledCardWrapper } from "@/components/card/ScaledCardWrapper";
import { WalletCard } from "@/components/card/WalletCard";
import { customConfigFor } from "@/lib/custom-stamp-presets";
import type { CardDesign } from "@/lib/types/design";

/**
 * Compact, non-interactive hero card. Leads with the custom-icon feature
 * (overlapping coffee stamps) so the headline capability is visible above the
 * fold. The full interactive designer lives in its own section lower down.
 */
export function CardHeroPreview() {
  const t = useTranslations("features.design-de-carte.custom.playground");
  const themes = t.raw("themes") as Array<{ name: string; orgName: string }>;

  const design: Partial<CardDesign> = {
    organization_name: themes[0].orgName,
    background_color: "#1c1c1e",
    stamp_filled_color: "#f97316",
    icon_color: "#ffffff",
    total_stamps: 10,
    stamp_icon_mode: "custom",
    custom_stamp_config: customConfigFor(["coffee"], {
      arrangement: "overlap",
      empty_mode: "greyscale",
      empty_opacity: 100,
    }),
    secondary_fields: [
      { key: "member", label: t("memberLabel"), value: t("memberName") },
      { key: "reward", label: t("rewardLabel"), value: t("rewardValue") },
    ],
  };

  return (
    <div className="w-full max-w-[300px] mx-auto lg:ml-auto lg:mr-0">
      <ScaledCardWrapper baseWidth={300}>
        <WalletCard design={design} stamps={6} showQR={false} interactive3D />
      </ScaledCardWrapper>
    </div>
  );
}
