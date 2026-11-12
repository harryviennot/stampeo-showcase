import { getTranslations } from "next-intl/server";
import { WalletCard } from "@/components/card/WalletCard";
import type { CardDesign } from "@/lib/types/design";
import { PassFrame } from "./PassFrame";
import { AUREVO } from "./samples";

/** Aurevo's card design with the member and reward fields `HeroCardStack` gives it, so it reads as a whole pass. */
export async function aurevoDesign(): Promise<Partial<CardDesign>> {
  const t = await getTranslations("features.design-de-carte.custom.playground");
  return {
    ...AUREVO.design,
    secondary_fields: [
      { key: "member", label: t("memberLabel"), value: t("memberName") },
      { key: "reward", label: t("rewardLabel"), value: t("rewardValue") },
    ],
  };
}

/** The Aurevo card at `stamps` of 8, with its member and reward fields. */
export async function AurevoCard({ stamps, width }: Readonly<{ stamps: number; width: number }>) {
  return (
    <PassFrame width={width}>
      <WalletCard design={await aurevoDesign()} stamps={stamps} />
    </PassFrame>
  );
}
