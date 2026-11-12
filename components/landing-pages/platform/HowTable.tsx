import { ArrowRightIcon } from "@/components/icons";
import { ScannerLoop } from "@/components/ui/ScannerLoop";
import { PLATFORM } from "@/lib/landing-pages/copy/platform";
import { SCANNER_LOOP } from "@/lib/videos/scanner-loop";
import { LpSection } from "../shared/LpSection";
import { WalletPhone } from "../shared/WalletPhone";
import { ARROW_LINK } from "./classes";
import { StepsTable } from "./StepsTable";

/** Both phones are drawn at 280px and shrunk to 160px on a phone. */
const PHONE = { full: 280, narrow: 160 };

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
            <WalletPhone width={PHONE.full} narrowWidth={PHONE.narrow} stamps={SCANNER_LOOP.stamps} />
            <ScannerLoop width={PHONE.full} narrowWidth={PHONE.narrow} />
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
