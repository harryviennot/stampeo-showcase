import { CheckIcon } from "@/components/icons";
import type { Fact } from "@/lib/landing-pages/copy/types";
import { PlanChip } from "./PlanChip";

/** Short facts with a check each and, where a fact belongs to some plans, their chip after it. */
export function FactList({ facts, className = "" }: Readonly<{ facts: readonly Fact[]; className?: string }>) {
  return (
    <ul className={`flex flex-col gap-3 ${className}`}>
      {facts.map((fact) => (
        <li key={fact.text} className="flex items-start gap-3 text-base text-[var(--foreground)]">
          <CheckIcon size={20} weight="bold" aria-hidden className="mt-0.5 shrink-0 text-[var(--accent)]" />
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1.5">
            <span className="text-pretty">{fact.text}</span>
            {fact.plan && <PlanChip plan={fact.plan} />}
          </span>
        </li>
      ))}
    </ul>
  );
}
