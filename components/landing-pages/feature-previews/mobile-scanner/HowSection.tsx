import { ArrowRightIcon } from "@/components/icons";
import { ScannerLoop } from "@/components/ui/ScannerLoop";
import { MOBILE_SCANNER_PREVIEW } from "@/lib/landing-pages/copy/previews/mobile-scanner";
import { SCANNER_LOOP } from "@/lib/videos/scanner-loop";
import { LpSection } from "../../shared/LpSection";
import { WalletPhone } from "../../shared/WalletPhone";
import { ARROW_LINK } from "../../platform/classes";
import { STEPS_PHONE, StepsTable } from "../../platform/StepsTable";

/**
 * "Scan, check, confirm": the customer's card at the stamps the Scanner ends on,
 * beside the Scanner's finished-stamp screen (the hero already plays the video),
 * sinking behind the table of the three steps, and the link that scrolls to the demo.
 */
export function HowSection() {
  const { eyebrow, title, lead, cells, link } = MOBILE_SCANNER_PREVIEW.how;

  return (
    <LpSection section="how" eyebrow={eyebrow} title={title} lead={lead} align="center">
      <StepsTable
        cells={cells}
        visual={
          <>
            <WalletPhone width={STEPS_PHONE.full} narrowWidth={STEPS_PHONE.narrow} stamps={SCANNER_LOOP.stamps} />
            <ScannerLoop still width={STEPS_PHONE.full} narrowWidth={STEPS_PHONE.narrow} />
          </>
        }
        link={
          <a href="#demo" className={ARROW_LINK}>
            {link}
            <ArrowRightIcon size={16} weight="bold" aria-hidden />
          </a>
        }
      />
    </LpSection>
  );
}
