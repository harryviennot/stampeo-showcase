import { ScanDemo } from "@/components/features/scanner-mobile/ScanDemo";
import { PLATFORM } from "@/lib/landing-pages/copy/platform";
import { DashboardDuo } from "../shared/DashboardDuo";
import { LpSection } from "../shared/LpSection";
import { PlatformToggleCard } from "./PlatformToggleCard";

/**
 * "Run it from your computer or your phone": the Dashboard and Scanner app
 * toggle. The dashboard pane is the computer and phone captures; the scanner
 * pane is the live scan demo, cut short with a fade.
 */
export function PlatformSection() {
  return (
    <LpSection
      section="platform"
      eyebrow={PLATFORM.platform.eyebrow}
      title={PLATFORM.platform.title}
      lead={PLATFORM.platform.lead}
      align="center"
    >
      <PlatformToggleCard
        dashboard={<DashboardDuo />}
        scanner={
          <div className="flex max-h-[380px] w-full justify-center overflow-hidden lg:max-h-[440px] [mask-image:linear-gradient(to_bottom,#000_84%,transparent)]">
            <ScanDemo chrome="minimal" />
          </div>
        }
      />
    </LpSection>
  );
}
