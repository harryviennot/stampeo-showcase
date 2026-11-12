import dynamic from "next/dynamic";
import { CTAButton } from "@/components/ui/CTAButton";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { LpHeading, LpSection } from "./LpSection";

const HeroDemo = dynamic(() => import("@/components/sections/HeroDemo").then((m) => m.HeroDemo));

/** The live wallet demo; its trial CTA shows in every state, as on iPhone most "add" taps never finish. */
export function LpDemo() {
  return (
    <LpSection section="demo" anchor>
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-8">
        <ScrollReveal className="lg:col-start-1 lg:row-start-1 lg:self-end">
          <LpHeading title={SHARED.demo.title} lead={SHARED.demo.lead} />
        </ScrollReveal>
        <ScrollReveal
          delay={150}
          className="flex flex-col items-center lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:justify-center"
        >
          <HeroDemo />
        </ScrollReveal>
        <ScrollReveal className="lg:col-start-1 lg:row-start-2 lg:self-start">
          <CTAButton label={SHARED.cta} variant="outline" trackAs="feature_cta" className="w-full sm:w-auto" />
        </ScrollReveal>
      </div>
    </LpSection>
  );
}
