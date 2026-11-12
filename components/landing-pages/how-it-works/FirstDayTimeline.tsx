import type { Icon } from "@phosphor-icons/react";
import {
  CalendarCheckIcon,
  CheckIcon,
  DevicePhoneMobileIcon,
  PaletteIcon,
  PrinterIcon,
  StorefrontIcon,
} from "@/components/icons";
import { RegionText } from "@/components/market/RegionText";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { HOW_IT_WORKS } from "@/lib/landing-pages/copy/how-it-works";
import { DashedRail } from "../shared/DashedRail";
import { LpSection } from "../shared/LpSection";

/** One icon per moment, in the order of the copy: the numbers belong to the steps above. */
const MOMENT_ICONS: Icon[] = [
  StorefrontIcon,
  PaletteIcon,
  DevicePhoneMobileIcon,
  CalendarCheckIcon,
  PrinterIcon,
];

/** The moment that is the point of the page: the test card on the owner's own phone, before any plan. */
const TEST_CARD = 2;

/**
 * What happens after "Start my free trial": five moments on a rail (down the
 * left on a phone, across from `lg`), the third being a test card on the
 * owner's own phone before any plan. Each line goes through `RegionText`
 * because the trial length is the visitor's region's.
 */
export function FirstDayTimeline() {
  const { title, lead, items, closing } = HOW_IT_WORKS.firstDay;

  return (
    <LpSection section="first_day" tinted title={title} lead={lead} align="center">
      <ol className="mx-auto flex max-w-md flex-col lg:max-w-6xl lg:grid lg:grid-cols-5 lg:gap-6">
        {items.map((item, index) => {
          const Icon = MOMENT_ICONS[index];

          return (
            <li key={index} className="relative flex gap-4 pb-8 last:pb-0 lg:flex-col lg:items-center lg:gap-4 lg:pb-0 lg:text-center">
              {index < items.length - 1 && (
                <DashedRail className="bottom-2 left-[22px] top-[52px] lg:bottom-auto lg:left-[calc(50%+30px)] lg:top-[22px] lg:w-[calc(100%-36px)]" />
              )}
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-sm ring-1 ${
                  index === TEST_CARD
                    ? "bg-[var(--accent)] text-white ring-[var(--accent)]"
                    : "bg-white text-[var(--foreground)] ring-[var(--border)]"
                }`}
              >
                <Icon size={22} weight="duotone" aria-hidden />
              </span>
              <p className="min-h-11 pt-2.5 text-pretty text-base text-[var(--foreground)] lg:min-h-0 lg:text-balance lg:pt-0">
                <RegionText raw={item} />
              </p>
            </li>
          );
        })}
      </ol>

      <ScrollReveal delay={200} className="mt-10 flex items-center justify-center gap-2.5 lg:mt-14">
        <span aria-hidden className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-white">
          <CheckIcon size={16} weight="bold" />
        </span>
        <p className="text-lead font-semibold text-[var(--foreground)]">{closing}</p>
      </ScrollReveal>
    </LpSection>
  );
}
