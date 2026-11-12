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

/**
 * The kinds of shop Stampeo is for, drifting past on one row. The track holds
 * the list twice and travels one list-width, so the loop has no seam; the second
 * copy is hidden from readers, and for readers who ask for less motion the
 * row stands still, wrapped, with one copy.
 */
export function TypeMarquee() {
  const { label, types } = PLATFORM.marquee;
  const track = [...types, ...types];

  return (
    <LpSection section="marquee" bare>
      <section className="py-5 lg:py-8">
        <Container>
          <div className="flex items-center gap-4 motion-reduce:flex-col motion-reduce:gap-4 lg:gap-8">
            <p className={`shrink-0 ${EYEBROW} text-[var(--muted-foreground)]`}>
              {label}
            </p>
            <div className="min-w-0 flex-1 overflow-hidden motion-reduce:w-full [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)] motion-reduce:[mask-image:none]">
              <ul className="flex w-max animate-[marquee-scroll_52s_linear_infinite] gap-3 py-1 will-change-transform motion-reduce:w-auto motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center">
                {track.map((type, index) => {
                  const Icon = BUSINESS_TYPE_ICONS[index % types.length];
                  const copy = index >= types.length;

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
          </div>
        </Container>
      </section>
    </LpSection>
  );
}
