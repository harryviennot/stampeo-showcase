import { ScannerLoop } from "@/components/ui/ScannerLoop";
import { PLATFORM } from "@/lib/landing-pages/copy/platform";
import { DashboardDuo } from "../shared/DashboardDuo";
import { LpSection } from "../shared/LpSection";
import { PlatformToggleCard } from "./PlatformToggleCard";

/** The scanner phone: drawn at 280px, shrunk to 190px on a phone so its pane is no taller than the dashboard's. */
const SCANNER = { full: 280, narrow: 190 };

/**
 * "Run it from your computer or your phone": the Dashboard and Scanner app
 * toggle. The dashboard pane is the computer and phone captures, with no
 * caption under them, centred in a box as tall as the scanner's on a phone so
 * both panes' titles sit at the same height; the scanner pane is the Scanner
 * loop, cut short with a fade (300px on a phone, 440px from `lg`), with room
 * above it for the phone's shadow.
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
        dashboard={
          <div className="flex min-h-[300px] w-full flex-col justify-center lg:min-h-0">
            <DashboardDuo caption={false} />
          </div>
        }
        scanner={
          <div className="-mt-6 flex max-h-[324px] w-full justify-center overflow-hidden pt-6 [mask-image:linear-gradient(to_bottom,#000_88%,transparent)] lg:max-h-[464px] lg:[mask-image:linear-gradient(to_bottom,#000_84%,transparent)]">
            <ScannerLoop width={SCANNER.full} narrowWidth={SCANNER.narrow} />
          </div>
        }
      />
    </LpSection>
  );
}
