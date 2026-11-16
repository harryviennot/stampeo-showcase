import { DevicePhoneMobileIcon, GlobeIcon } from "@/components/icons";
import { MOBILE_SCANNER_PREVIEW } from "@/lib/landing-pages/copy/previews/mobile-scanner";
import { IconTile } from "../../shared/IconTile";
import { LpSection } from "../../shared/LpSection";
import { LpCtaPair } from "../../platform/LpCtaPair";
import { StepsTable, type StepCell } from "../../platform/StepsTable";

/** The app and the browser, each led by an icon tile. */
const ICONS = [DevicePhoneMobileIcon, GlobeIcon];

/**
 * "An app, or just a browser": two bordered cells with no phones, then the
 * trial and the way to the demo.
 */
export function WaysSection() {
  const { eyebrow, title, lead, cells } = MOBILE_SCANNER_PREVIEW.ways;
  const steps: StepCell[] = cells.map((cell, index) => {
    const Icon = ICONS[index];

    return {
      ...cell,
      icon: (
        <IconTile tone="brand">
          <Icon size={22} weight="duotone" aria-hidden />
        </IconTile>
      ),
    };
  });

  return (
    <LpSection section="ways" eyebrow={eyebrow} title={title} lead={lead} align="center">
      <StepsTable cells={steps} />
      <div className="mt-10 flex justify-center">
        <LpCtaPair location="feature_cta" />
      </div>
    </LpSection>
  );
}
