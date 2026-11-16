import dynamic from "next/dynamic";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { SHARED } from "@/lib/landing-pages/copy/shared";
import { LpHeading, LpSection } from "./LpSection";
import { LpTrialButton } from "./LpTrialButton";

const HeroDemo = dynamic(() => import("@/components/sections/HeroDemo").then((m) => m.HeroDemo));

/**
 * The live wallet demo; its trial CTA shows in every state, as on iPhone most "add" taps never finish.
 * Left-aligned it is a split (words and button left, demo right); centred it is one column under an eyebrow.
 * A page can put its own `title` and `lead` over it.
 */
export function LpDemo({
  eyebrow,
  title = SHARED.demo.title,
  lead = SHARED.demo.lead,
  align = "left",
}: Readonly<{ eyebrow?: string; title?: string; lead?: string; align?: "left" | "center" }>) {
  const centered = align === "center";

  return (
    <LpSection section="demo" anchor>
      <div className={centered ? "flex flex-col items-center gap-10" : "grid gap-10 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-8"}>
        <ScrollReveal className={centered ? "" : "lg:col-start-1 lg:row-start-1 lg:self-end"}>
          <LpHeading title={title} lead={lead} eyebrow={eyebrow} align={align} />
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
          <LpTrialButton />
        </ScrollReveal>
      </div>
    </LpSection>
  );
}
