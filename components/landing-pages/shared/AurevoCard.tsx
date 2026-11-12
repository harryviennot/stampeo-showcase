import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { ScaledCardWrapper } from "@/components/card/ScaledCardWrapper";
import { WalletCard } from "@/components/card/WalletCard";
import { STAMP_SAMPLES } from "@/lib/loyalty-samples";

/** The sample café every visual on these pages belongs to. */
export const AUREVO = STAMP_SAMPLES.find((sample) => sample.id === "aurevo") ?? STAMP_SAMPLES[0];

/** The width the card is laid out at: the narrowest where its QR block fits under the fields. */
const LAYOUT_WIDTH = 300;
/** `ScaledCardWrapper`'s default aspect ratio, which sets the card's height. */
const CARD_RATIO = 1.282;

/**
 * A wallet card laid out at `LAYOUT_WIDTH` and shrunk to `width` by a fixed CSS
 * scale, so it draws at its final size on the server and does not resize when
 * the page hydrates.
 */
export function PassFrame({ width, children }: Readonly<{ width: number; children: ReactNode }>) {
  const scale = width / LAYOUT_WIDTH;

  return (
    <div style={{ width, height: LAYOUT_WIDTH * CARD_RATIO * scale }}>
      <div
        style={{ width: LAYOUT_WIDTH, transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        <ScaledCardWrapper baseWidth={LAYOUT_WIDTH}>{children}</ScaledCardWrapper>
      </div>
    </div>
  );
}

/**
 * The Aurevo card at `stamps` of 8, with the member and reward fields
 * `HeroCardStack` gives the same card, drawn at `width`.
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
    <PassFrame width={width}>
      <WalletCard design={design} stamps={stamps} />
    </PassFrame>
  );
}
