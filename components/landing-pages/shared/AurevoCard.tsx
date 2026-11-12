import { getTranslations } from "next-intl/server";
import { ScaledCardWrapper } from "@/components/card/ScaledCardWrapper";
import { WalletCard } from "@/components/card/WalletCard";
import { STAMP_SAMPLES } from "@/lib/loyalty-samples";

/** The sample café every visual on these pages belongs to. */
export const AUREVO = STAMP_SAMPLES.find((sample) => sample.id === "aurevo") ?? STAMP_SAMPLES[0];

/**
 * The Aurevo card at `stamps` of 8, with the member and reward fields
 * `HeroCardStack` gives the same card, laid out at exactly `width` px so it
 * draws at scale 1 on the server and does not resize when the page hydrates.
 * The caller's column must be `width` wide.
 */
export async function AurevoCard({ stamps, width }: Readonly<{ stamps: number; width: number }>) {
  const t = await getTranslations("features.design-de-carte.custom.playground");
  const design = {
    ...AUREVO.design,
    secondary_fields: [
      { key: "member", label: t("memberLabel"), value: t("memberName") },
      { key: "reward", label: t("rewardLabel"), value: t("rewardValue") },
    ],
  };

  return (
    <div style={{ width }}>
      <ScaledCardWrapper baseWidth={width}>
        <WalletCard design={design} stamps={stamps} showQR={false} />
      </ScaledCardWrapper>
    </div>
  );
}
