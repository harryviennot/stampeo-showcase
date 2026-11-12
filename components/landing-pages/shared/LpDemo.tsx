import dynamic from "next/dynamic";
import { CTAButton } from "@/components/ui/CTAButton";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { LpHeading, LpSection } from "./LpSection";

const HeroDemo = dynamic(() => import("@/components/sections/HeroDemo").then((m) => m.HeroDemo));

/**
 * The live wallet demo; its trial CTA shows in every state, as on iPhone most "add" taps never finish.
 * Left-aligned it is a split (words and button left, demo right); centred it is one column under an eyebrow.
 */
export function LpDemo({
  eyebrow,
  align = "left",
}: Readonly<{ eyebrow?: string; align?: "left" | "center" }>) {
  const centered = align === "center";

  return (
    <LpSection section="demo" anchor>
      <div className={centered ? "flex flex-col items-center gap-10" : "grid gap-10 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-8"}>
        <ScrollReveal className={centered ? "" : "lg:col-start-1 lg:row-start-1 lg:self-end"}>
          <LpHeading title={SHARED.demo.title} lead={SHARED.demo.lead} eyebrow={eyebrow} align={align} />
        </ScrollReveal>
        <ScrollReveal
          delay={150}
          className={
            centered
              ? "flex flex-col items-center"
              : "flex flex-col items-center lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:justify-center"
          }
        >
          <HeroDemo />
        </ScrollReveal>
        <ScrollReveal className={centered ? "w-full sm:w-auto" : "lg:col-start-1 lg:row-start-2 lg:self-start"}>
          <CTAButton label={SHARED.cta} variant="outline" trackAs="feature_cta" className="w-full sm:w-auto" />
        </ScrollReveal>
      </div>
    </LpSection>
  );
}
