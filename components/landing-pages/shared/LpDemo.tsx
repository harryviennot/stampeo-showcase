import dynamic from "next/dynamic";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { useLandingCopy } from "@/lib/landing-pages/copy/bundle";
import { LpHeading, LpSection } from "./LpSection";

const HeroDemo = dynamic(() => import("@/components/sections/HeroDemo").then((m) => m.HeroDemo));

/**
 * The live wallet demo, with nothing else to tap beside it: the demo is the action.
 * Left-aligned it is a split (words left, demo right); centred it is one column under an eyebrow.
 * A page can put its own `title` and `lead` over it.
 */
export function LpDemo({
  eyebrow,
  title,
  lead,
  align = "left",
}: Readonly<{ eyebrow?: string; title?: string; lead?: string; align?: "left" | "center" }>) {
  const { demo } = useLandingCopy().shared.SHARED;
  const centered = align === "center";

  return (
    <LpSection section="demo" anchor>
      <div className={centered ? "flex flex-col items-center gap-10" : "grid gap-10 lg:grid-cols-2 lg:gap-x-16 lg:gap-y-8"}>
        <ScrollReveal className={centered ? "" : "lg:col-start-1 lg:row-start-1 lg:self-center"}>
          <LpHeading title={title ?? demo.title} lead={lead ?? demo.lead} eyebrow={eyebrow} align={align} />
        </ScrollReveal>
        <ScrollReveal
          delay={150}
          className={
            centered
              ? "flex flex-col items-center"
              : "flex flex-col items-center lg:col-start-2 lg:row-start-1 lg:justify-center"
          }
        >
          <HeroDemo />
        </ScrollReveal>
      </div>
    </LpSection>
  );
}
