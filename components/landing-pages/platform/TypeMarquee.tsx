import type { Icon } from "@phosphor-icons/react";
import { Container } from "@/components/ui/Container";
import {
  BooksIcon,
  BreadIcon,
  CarIcon,
  CoffeeIcon,
  EyeIcon,
  FlowerLotusIcon,
  ForkKnifeIcon,
  OrangeSliceIcon,
  PawPrintIcon,
  ScissorsIcon,
  SparklesIcon,
  TruckIcon,
} from "@/components/icons";
import { PLATFORM } from "@/lib/landing-pages/copy/platform";
import { EYEBROW, LpSection } from "../shared/LpSection";

/** One icon per business type of `PLATFORM.marquee.types`, in the same order. */
export const BUSINESS_TYPE_ICONS: Icon[] = [
  CoffeeIcon,
  BreadIcon,
  ScissorsIcon,
  SparklesIcon,
  ForkKnifeIcon,
  BooksIcon,
  TruckIcon,
  FlowerLotusIcon,
  EyeIcon,
  OrangeSliceIcon,
  CarIcon,
  PawPrintIcon,
];

interface Chip {
  type: string;
  Icon: Icon;
}

const CHIPS: Chip[] = PLATFORM.marquee.types.map((type, index) => ({ type, Icon: BUSINESS_TYPE_ICONS[index] }));
/** Where a phone's first row ends and its second begins. */
const HALF = Math.ceil(CHIPS.length / 2);

/**
 * One drifting row of chips. The track holds them twice and travels one
 * list-width, so the loop has no seam; the second copy is hidden from readers.
 * For readers who ask for less motion it stands still, wrapped, with one copy.
 */
function Row({ chips, motion, className = "" }: Readonly<{ chips: Chip[]; motion: string; className?: string }>) {
  return (
    <div
      className={`min-w-0 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)] motion-reduce:[mask-image:none] ${className}`}
    >
      <ul
        className={`flex w-max gap-3 py-1 will-change-transform ${motion} motion-reduce:w-auto motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center`}
      >
        {[...chips, ...chips].map(({ type, Icon }, index) => {
          const copy = index >= chips.length;

          return (
            <li
              key={`${type}-${index}`}
              aria-hidden={copy ? true : undefined}
              className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-white/70 px-4 text-sm font-medium text-[var(--foreground)] ring-1 ring-black/5 ${
                copy ? "motion-reduce:hidden" : ""
              }`}
            >
              <Icon size={18} weight="duotone" aria-hidden className="text-[var(--muted-foreground)]" />
              {type}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * The kinds of shop Stampeo is for, drifting past. On a phone they run as two
 * rows of half the list each, one drifting left and one right; from `sm` they
 * run as one row. Readers who ask for less motion get the one row, still and
 * wrapped, at every width.
 */
export function TypeMarquee() {
  const { label } = PLATFORM.marquee;

  return (
    <LpSection section="marquee" bare>
      <section className="py-5 lg:py-8">
        <Container>
          <div className="flex flex-col items-center gap-3 motion-reduce:gap-4 sm:gap-4 sm:motion-safe:flex-row lg:gap-8">
            <p className={`shrink-0 ${EYEBROW} text-[var(--muted-foreground)]`}>{label}</p>
            <div className="-mx-4 flex flex-col gap-2 self-stretch sm:hidden motion-reduce:hidden">
              <Row chips={CHIPS.slice(0, HALF)} motion="animate-[marquee-scroll_30s_linear_infinite]" />
              <Row chips={CHIPS.slice(HALF)} motion="animate-[marquee-scroll_30s_linear_infinite] [animation-direction:reverse]" />
            </div>
            <Row
              chips={CHIPS}
              motion="animate-[marquee-scroll_52s_linear_infinite]"
              className="hidden flex-1 sm:block motion-reduce:block motion-reduce:w-full"
            />
          </div>
        </Container>
      </section>
    </LpSection>
  );
}
