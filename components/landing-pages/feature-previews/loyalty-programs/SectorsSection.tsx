import { LOYALTY_PROGRAMS_PREVIEW } from "@/lib/landing-pages/copy/previews/loyalty-programs";
import { LpSection } from "../../shared/LpSection";

/** Placeholder until the section is built. */
export function SectorsSection() {
  const { eyebrow, title, lead } = LOYALTY_PROGRAMS_PREVIEW.sectors;

  return <LpSection section="sectors" eyebrow={eyebrow} title={title} lead={lead} align="center" />;
}
