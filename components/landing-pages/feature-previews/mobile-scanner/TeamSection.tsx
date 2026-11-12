import { MOBILE_SCANNER_PREVIEW } from "@/lib/landing-pages/copy/previews/mobile-scanner";
import { LpSection } from "../../shared/LpSection";
import { ToggleCard } from "../../platform/ToggleCard";
import { JoinCodeMini, LimitMini } from "./TeamMinis";

/**
 * "Free for your whole team": a toggle between what staff see (a code, then
 * the scanner) and what owners and admins can do (scan, and let a scan past
 * a daily limit under their name), each with its Scanner screen.
 */
export function TeamSection() {
  const { eyebrow, title, lead, tabs } = MOBILE_SCANNER_PREVIEW.team;

  return (
    <LpSection section="team" eyebrow={eyebrow} title={title} lead={lead} align="center">
      <ToggleCard
        ariaLabel={title}
        tabs={[
          { key: "staff", ...tabs.staff, facts: [...tabs.staff.facts], visual: <JoinCodeMini /> },
          { key: "owners", ...tabs.owners, facts: [...tabs.owners.facts], visual: <LimitMini /> },
        ]}
      />
    </LpSection>
  );
}
