import { ArrowRightIcon } from "@/components/icons";
import { ScanDemo } from "@/components/features/scanner-mobile/ScanDemo";
import { iphoneLayout } from "@/lib/devices/iphone";
import { PLATFORM } from "@/lib/landing-pages/copy/platform";
import { LpSection } from "../shared/LpSection";
import { WalletPhone } from "../shared/WalletPhone";
import { ScaledBox } from "./ScaledBox";

/** Both phones are drawn at 280px and shrunk to 160px on a phone. */
const PHONE = { full: 280, narrow: 160 };

/**
 * "Create it, share it, stamp it": the card in Apple Wallet and the scanner
 * side by side, their lower halves sinking behind a bordered table of the three
 * steps. On a phone the table is a stack of three rows.
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
        <div className="flex max-h-[262px] justify-center gap-4 overflow-hidden lg:max-h-[440px] lg:gap-10">
          <ScaledBox width={PHONE.full} height={height} narrowWidth={PHONE.narrow}>
            <WalletPhone width={PHONE.full} />
          </ScaledBox>
          <ScaledBox width={PHONE.full} height={height} narrowWidth={PHONE.narrow}>
            <ScanDemo chrome="minimal" />
          </ScaledBox>
        </div>

        <ol className="relative -mt-10 grid divide-y divide-[var(--border)] overflow-hidden rounded-2xl border border-[var(--border)] bg-white/80 backdrop-blur-xl lg:-mt-44 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          {PLATFORM.how.cells.map((cell) => (
            <li key={cell.title} className="p-6 lg:p-8">
              <h3 className="text-[1.75rem] leading-tight font-bold tracking-[-0.015em] text-[var(--foreground)]">
                {cell.title}
              </h3>
              <p className="mt-3 text-base text-pretty text-[var(--muted-foreground)]">{cell.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex justify-center">
          <a
            href="#demo"
            className="inline-flex min-h-11 items-center gap-2 text-base font-semibold text-[var(--accent-hover)] underline-offset-4 hover:underline"
          >
            {PLATFORM.how.link}
            <ArrowRightIcon size={16} weight="bold" aria-hidden />
          </a>
        </div>
      </div>
    </LpSection>
  );
}
