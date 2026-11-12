import type { ReactNode } from "react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { LandingSectionId } from "@/lib/landing-pages/pages";
import { LpHeading, LpSection } from "./LpSection";

/** One idea beside one visual, text first on a phone. */
export function LpSpotlight({
  section,
  title,
  lead,
  visual,
  tinted = false,
  children,
}: Readonly<{
  section: LandingSectionId;
  title: string;
  lead: string;
  visual: ReactNode;
  tinted?: boolean;
  /** Extra lines under the lead, e.g. a broadcast line with its plan label. */
  children?: ReactNode;
}>) {
  return (
    <LpSection section={section} tinted={tinted}>
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        <ScrollReveal>
          <LpHeading title={title} lead={lead} />
          {children}
        </ScrollReveal>
        <ScrollReveal delay={150} variant="right" className="flex justify-center">
          {visual}
        </ScrollReveal>
      </div>
    </LpSection>
  );
}
