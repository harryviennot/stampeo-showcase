import { LOYALTY_PROGRAMS_PREVIEW } from "@/lib/landing-pages/copy/previews/loyalty-programs";
import { LpSection } from "../../shared/LpSection";

/** Placeholder until the section is built. */
export function ProgramsSection() {
  const { eyebrow, title, lead } = LOYALTY_PROGRAMS_PREVIEW.programs;

  return <LpSection section="programs" eyebrow={eyebrow} title={title} lead={lead} align="center" />;
}
