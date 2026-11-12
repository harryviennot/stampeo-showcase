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

const ORDINALS = new Intl.PluralRules("en-US", { type: "ordinal" });
const ORDINAL_SUFFIX = { one: "st", two: "nd", few: "rd", other: "th" } as Record<string, string>;

/** "10th": the card's reward field names the stamp that earns it, so it follows the card's size. */
const ordinal = (count: number) => `${count}${ORDINAL_SUFFIX[ORDINALS.select(count)] ?? "th"}`;

/** The Aurevo card at `stamps` of 8, or of `total`, with its member and reward fields; the reward field names the card's last stamp. */
export async function AurevoCard({
  stamps,
  width,
  total,
}: Readonly<{ stamps: number; width: number; total?: number }>) {
  const design = await aurevoDesign();
  const sized: Partial<CardDesign> =
    total === undefined
      ? design
      : {
          ...design,
          total_stamps: total,
          secondary_fields: design.secondary_fields?.map((field) =>
            field.key === "reward" ? { ...field, value: field.value.replace(/^\d+(?:st|nd|rd|th)/, ordinal(total)) } : field,
          ),
        };

  return (
    <PassFrame width={width}>
      <WalletCard design={sized} stamps={stamps} />
    </PassFrame>
  );
}
