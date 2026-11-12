import { LiveActivityFeed } from "@/components/features/analytics/LiveActivityFeed";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { HOW_IT_WORKS } from "@/lib/landing-pages/copy/how-it-works";
import { LpHeading, LpSection } from "../shared/LpSection";

/** The owner's side of the stamp: the live feed shows each stamp, reward and new card as it happens. */
export function SeeItWork() {
  const { title, lead } = HOW_IT_WORKS.seeItWork;

  return (
    <LpSection section="see_it_work">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <ScrollReveal>
          <LpHeading title={title} lead={lead} />
        </ScrollReveal>
        <ScrollReveal delay={150} variant="right" className="mx-auto w-full max-w-[520px]">
          <LiveActivityFeed cardOnly />
        </ScrollReveal>
      </div>
    </LpSection>
  );
}
