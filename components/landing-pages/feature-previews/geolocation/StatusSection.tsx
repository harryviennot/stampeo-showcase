import { CheckIcon, ClockIcon } from "@/components/icons";
import { GEOLOCATION_PREVIEW } from "@/lib/landing-pages/copy/previews/geolocation";
import type { Fact, PlanChip } from "@/lib/landing-pages/copy/types";
import { CELL_TITLE, STAMPED_CARD } from "../../platform/classes";
import { LpSection } from "../../shared/LpSection";
import { PlanChip as Chip } from "../../shared/PlanChip";

/** The two marks: a green check for what is live, a grey clock for what is planned. */
const MARKS = {
  live: { Icon: CheckIcon, tile: "bg-[#2e9e5b]/12 text-[#2e9e5b]" },
  planned: { Icon: ClockIcon, tile: "bg-[var(--background-subtle)] text-[var(--muted-foreground)]" },
} as const;

/** One column of the table: its heading, its plan chip if it has one, and its facts, each with the column's mark. */
function Column({
  which,
  title,
  plan,
  facts,
  mark,
  className = "",
}: Readonly<{
  which: "today" | "soon";
  title: string;
  plan?: PlanChip;
  facts: readonly Fact[];
  mark: keyof typeof MARKS;
  className?: string;
}>) {
  const { Icon, tile } = MARKS[mark];

  return (
    <div data-column={which} className={`p-5 sm:p-7 lg:p-9 ${className}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h3 className={CELL_TITLE}>{title}</h3>
        {plan && <Chip plan={plan} />}
      </div>
      <ul className="mt-6 flex flex-col gap-5">
        {facts.map((fact) => (
          <li key={fact.text} data-mark={mark === "live" ? "live" : "planned"} className="flex items-start gap-3.5">
            <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${tile}`}>
              <Icon size={16} weight="bold" aria-hidden />
            </span>
            <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1.5 text-base leading-snug text-[var(--foreground)] sm:text-[17px]">
              <span className="text-pretty">{fact.text}</span>
              {fact.plan && <Chip plan={fact.plan} />}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** One stamped two-column table that keeps what is live (green check) apart from what is coming (clock, under the Pro chip); the columns stack on a phone, Today first. */
export function StatusSection() {
  const { eyebrow, title, lead, today, soon } = GEOLOCATION_PREVIEW.status;

  return (
    <LpSection section="status" eyebrow={eyebrow} title={title} lead={lead} align="center">
      <div
        className={`mx-auto grid max-w-[1040px] divide-y divide-[var(--border)] overflow-hidden text-left lg:grid-cols-2 lg:divide-x lg:divide-y-0 ${STAMPED_CARD}`}
      >
        <Column which="today" title={today.title} facts={today.facts} mark="live" />
        <Column which="soon" title={soon.title} plan={soon.plan} facts={soon.facts} mark="planned" className="bg-[var(--paper)]" />
      </div>
    </LpSection>
  );
}
