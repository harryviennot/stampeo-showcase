import dynamic from "next/dynamic";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { PUSH_NOTIFICATIONS_PREVIEW as COPY } from "@/lib/landing-pages/copy/previews/push-notifications";
import { LpHeading, LpSection } from "../../shared/LpSection";
import { LpTrialButton } from "../../shared/LpTrialButton";

const HeroDemo = dynamic(() => import("@/components/sections/HeroDemo").then((m) => m.HeroDemo));

/**
 * The live wallet demo under the page's own label, title and lead, centred, with the trial offered under it
 * in every state of the demo.
 */
export function PushDemo() {
  const { eyebrow, title, lead } = COPY.demo;

  return (
    <LpSection section="demo" anchor>
      <div className="flex flex-col items-center gap-10">
        <ScrollReveal>
          <LpHeading title={title} lead={lead} eyebrow={eyebrow} align="center" />
        </ScrollReveal>
        <ScrollReveal delay={150} className="flex flex-col items-center">
          <HeroDemo />
        </ScrollReveal>
        <ScrollReveal className="w-full sm:w-auto">
          <LpTrialButton />
        </ScrollReveal>
      </div>
    </LpSection>
  );
}
