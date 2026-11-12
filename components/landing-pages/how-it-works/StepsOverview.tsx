import { ChevronDownIcon } from "@/components/icons";
import { NumberStamp } from "@/components/stamps/StampIcons";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { HOW_IT_WORKS } from "@/lib/landing-pages/copy/how-it-works";
import { DashedRail } from "../shared/DashedRail";
import { LpSection } from "../shared/LpSection";

/** The sections the three steps jump to, in order. */
const STEP_SECTIONS = ["step_create", "step_share", "step_stamp"] as const;

/**
 * The map of the page: three numbered steps, each a link to its section,
 * joined by a dashed line (down the stamps on a phone, across them from `lg`).
 */
export function StepsOverview() {
  const { title, lead, items } = HOW_IT_WORKS.steps;

  return (
    <LpSection section="steps" tinted title={title} lead={lead} align="center">
      <ol className="mx-auto flex max-w-md flex-col gap-3 lg:grid lg:max-w-5xl lg:grid-cols-3 lg:gap-6">
        {items.map((step, index) => (
          <li key={step.title}>
            <ScrollReveal delay={index * 100} className="relative h-full">
              {index < items.length - 1 && (
                <DashedRail className="left-5 top-[60px] -bottom-6 lg:bottom-auto lg:left-[calc(50%+28px)] lg:top-5 lg:w-[calc(100%-32px)]" />
              )}
              <a
                href={`#${STEP_SECTIONS[index]}`}
                className="group flex min-h-[72px] items-start gap-3 rounded-2xl outline-offset-4 focus-visible:outline-2 focus-visible:outline-[var(--accent)] lg:h-full lg:min-h-0 lg:flex-col lg:items-center lg:gap-4"
              >
                <NumberStamp number={index + 1} size={40} color="var(--accent)" className="mt-4 shrink-0 lg:mt-0" />
                <span className="flex min-h-[72px] flex-1 items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[var(--border)] transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md group-hover:ring-[var(--accent)] lg:min-h-[132px] lg:w-full lg:flex-1 lg:flex-col lg:justify-center lg:gap-2 lg:px-6 lg:text-center">
                  <span className="flex-1 lg:flex-none">
                    <span className="block text-h3 text-[var(--foreground)]">{step.title}</span>
                    <span className="mt-1 block text-base text-[var(--muted-foreground)]">{step.body}</span>
                  </span>
                  <ChevronDownIcon
                    size={18}
                    weight="bold"
                    aria-hidden
                    className="shrink-0 text-[var(--muted-foreground)] transition-transform duration-200 group-hover:translate-y-0.5 group-hover:text-[var(--accent-hover)]"
                  />
                </span>
              </a>
            </ScrollReveal>
          </li>
        ))}
      </ol>
    </LpSection>
  );
}
