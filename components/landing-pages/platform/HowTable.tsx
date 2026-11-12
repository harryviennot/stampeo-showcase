import { ArrowRightIcon } from "@/components/icons";
import { ScanDemo } from "@/components/features/scanner-mobile/ScanDemo";
import { iphoneLayout } from "@/lib/devices/iphone";
import { PLATFORM } from "@/lib/landing-pages/copy/platform";
import { LpSection } from "../shared/LpSection";
import { ScaledBox } from "../shared/ScaledBox";
import { WalletPhone } from "../shared/WalletPhone";
import { ARROW_LINK, CELL_TITLE } from "./classes";

/** Both phones are drawn at 280px and shrunk to 160px on a phone. */
const PHONE = { full: 280, narrow: 160 };

/**
 * "Create it, share it, stamp it": the card in Apple Wallet and the scanner
 * side by side, their lower parts sinking behind a bordered table of the three
 * steps (low enough that the card's code and the scanner's frame show above
 * it), with room above the phones for their shadows. On a phone the table is a
 * stack of three rows.
 */
export function HowTable() {
  const height = iphoneLayout(PHONE.full).height;

  return (
    <LpSection
      section="how"
      eyebrow={PLATFORM.how.eyebrow}
      title={PLATFORM.how.title}
      lead={PLATFORM.how.lead}
      align="center"
    >
      <div className="mx-auto max-w-[560px] lg:max-w-[1040px]">
        <div className="-mt-6 flex max-h-[286px] justify-center gap-4 overflow-hidden pt-6 lg:max-h-[464px] lg:gap-10">
          <WalletPhone width={PHONE.full} narrowWidth={PHONE.narrow} />
          <ScaledBox width={PHONE.full} height={height} narrowTo={PHONE.narrow}>
            <ScanDemo chrome="minimal" stillWhenReduced />
          </ScaledBox>
        </div>

        <ol className="relative -mt-10 grid divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-white/80 backdrop-blur-xl lg:-mt-24 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          {PLATFORM.how.cells.map((cell) => (
            <li key={cell.title} className="p-5 lg:p-8">
              <h3 className={CELL_TITLE}>{cell.title}</h3>
              <p className="mt-3 text-base text-pretty text-[var(--muted-foreground)]">{cell.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex justify-center">
          <a href="#demo" className={ARROW_LINK}>
            {PLATFORM.how.link}
            <ArrowRightIcon size={16} weight="bold" aria-hidden />
          </a>
        </div>
      </div>
    </LpSection>
  );
}
