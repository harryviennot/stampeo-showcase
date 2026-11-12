import type { ReactNode } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { LpHeading, LpSection } from "./LpSection";
import { PhoneCrop } from "./PhoneCrop";
import type { LandingSectionId } from "@/lib/landing-pages/pages";

/** One idea beside one visual, text first on a phone; `cropOnPhone` cuts a tall device there. */
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
          className={`flex justify-center ${side === "left" ? "lg:order-1" : ""}`}
        >
          {cropOnPhone ? <PhoneCrop>{visual}</PhoneCrop> : visual}
        </ScrollReveal>
      </div>
    </LpSection>
  );
}
