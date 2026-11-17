import { BellIcon, MapPinIcon, StorefrontIcon } from "@/components/icons";
import { useLandingCopy } from "@/lib/landing-pages/copy/bundle";
import { StepsTable } from "../../platform/StepsTable";
import { IconTile } from "../../shared/IconTile";
import { LpSection } from "../../shared/LpSection";

/** The address, the customer nearby, the card on their lock screen. */
const ICONS = [StorefrontIcon, MapPinIcon, BellIcon];

/** Three steps in the future tense, in Platform's plain table, each led by an icon tile; the hero's "See how it will work" lands here. */
export function HowSection() {
  const { eyebrow, title, lead, cells } = useLandingCopy().previews.geolocation.GEOLOCATION_PREVIEW.how;
  const steps = cells.map((cell, index) => {
    const Icon = ICONS[index];

    return {
      ...cell,
      icon: (
        <IconTile tone="subtle">
          <Icon size={22} weight="duotone" aria-hidden />
        </IconTile>
      ),
    };
  });

  return (
    <LpSection section="how" anchor eyebrow={eyebrow} title={title} lead={lead} align="center">
      <StepsTable cells={steps} />
    </LpSection>
  );
}
