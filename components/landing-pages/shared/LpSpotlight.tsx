import type { ReactNode } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { LpHeading, LpSection } from "./LpSection";
import type { LandingSectionId } from "@/lib/landing-pages/pages";

/**
 * One idea beside one visual: the heading and lead (and an optional line of
 * small print or a plan label) next to the picture. A single column on a phone,
 * text first; two columns from `lg`, with the visual on `side`. `cropOnPhone`
 * cuts a tall device at 420px on a phone, where its clock and banners sit in
 * the top half.
 */
export function LpSpotlight({
  section,
  title,
  lead,
  visual,
  side = "right",
  cropOnPhone = false,
  tinted = false,
  children,
}: Readonly<{
  section: LandingSectionId;
  title: string;
  lead: string;
  visual: ReactNode;
  side?: "left" | "right";
  cropOnPhone?: boolean;
  tinted?: boolean;
  /** Extra lines under the lead, e.g. a broadcast line with its plan label. */
  children?: ReactNode;
}>) {
  return (
    <LpSection section={section} tinted={tinted}>
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <ScrollReveal className={side === "left" ? "lg:order-2" : ""}>
          <LpHeading title={title} lead={lead} />
          {children}
        </ScrollReveal>
        <ScrollReveal
          delay={150}
          variant={side === "left" ? "left" : "right"}
          className={`flex justify-center ${side === "left" ? "lg:order-1 lg:justify-start" : "lg:justify-end"} ${
            cropOnPhone ? "max-h-[420px] overflow-hidden lg:max-h-none lg:overflow-visible" : ""
          }`}
        >
          {visual}
        </ScrollReveal>
      </div>
    </LpSection>
  );
}
