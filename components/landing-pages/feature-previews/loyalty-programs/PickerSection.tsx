import { LOYALTY_PROGRAMS_PREVIEW } from "@/lib/landing-pages/copy/previews/loyalty-programs";
import { LpSection } from "../../shared/LpSection";

/** Placeholder until the section is built. */
export function PickerSection() {
  const { eyebrow, title, lead } = LOYALTY_PROGRAMS_PREVIEW.picker;

  return <LpSection section="picker" eyebrow={eyebrow} title={title} lead={lead} align="center" />;
}
