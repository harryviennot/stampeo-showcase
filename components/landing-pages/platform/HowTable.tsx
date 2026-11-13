import { ArrowRightIcon } from "@/components/icons";
import { ScannerLoop } from "@/components/ui/ScannerLoop";
import { PLATFORM } from "@/lib/landing-pages/copy/platform";
import { SCANNER_LOOP } from "@/lib/videos/scanner-loop";
import { LpSection } from "../shared/LpSection";
import { WalletPhone } from "../shared/WalletPhone";
import { ARROW_LINK } from "./classes";
import { STEPS_PHONE, StepsTable } from "./StepsTable";

/**
 * "Create it, share it, stamp it": the card in Apple Wallet and the scanner
 * side by side, sinking behind the table of the three steps, and the link that
 * scrolls to the demo.
 */
export function HowTable() {
  return (
    <LpSection
      section="how"
      eyebrow={PLATFORM.how.eyebrow}
      title={PLATFORM.how.title}
      lead={PLATFORM.how.lead}
      align="center"
    >
      <StepsTable
        cells={PLATFORM.how.cells}
        visual={
          <>
            <WalletPhone width={STEPS_PHONE.full} narrowWidth={STEPS_PHONE.narrow} stamps={SCANNER_LOOP.stamps} />
            <ScannerLoop width={STEPS_PHONE.full} narrowWidth={STEPS_PHONE.narrow} />
          </>
        }
        link={
          <a href="#demo" className={ARROW_LINK}>
            {PLATFORM.how.link}
            <ArrowRightIcon size={16} weight="bold" aria-hidden />
          </a>
        }
      />
    </LpSection>
  );
}
