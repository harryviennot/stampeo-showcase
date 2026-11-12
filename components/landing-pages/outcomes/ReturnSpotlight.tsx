import { OUTCOMES } from "@/lib/landing-pages/copy/outcomes";
import { AurevoCard } from "../shared/AurevoCard";
import { LpSpotlight } from "../shared/LpSpotlight";

/** They come back sooner: the card part-filled, and the head start with its study under the lead. */
export function ReturnSpotlight() {
  const { title, lead, headStart } = OUTCOMES.comeBack;

  return (
    <LpSpotlight
      section="outcome_return"
      title={title}
      lead={lead}
      visual={<AurevoCard stamps={5} width={300} />}
    >
      <p className="mt-6 max-w-xl text-pretty text-base text-[var(--foreground)]">{headStart.text}</p>
      <p className="mt-2 max-w-xl text-pretty text-sm text-[var(--muted-foreground)]">{headStart.source}</p>
    </LpSpotlight>
  );
}
