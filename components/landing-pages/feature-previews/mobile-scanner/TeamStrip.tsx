import { CheckIcon } from "@/components/icons";
import { NumberStamp } from "@/components/stamps/StampIcons";
import { MOBILE_SCANNER_PREVIEW } from "@/lib/landing-pages/copy/previews/mobile-scanner";
import { DashedRail } from "../../shared/DashedRail";
import { LpSection } from "../../shared/LpSection";
import { PlanChip } from "../../shared/PlanChip";
import { ScannerReadyFrame, StaffPhoneFrame, TeamPageFrame } from "./TeamFrames";

/**
 * Three numbered frames joined by a dashed rail (down the side on a phone, across from `lg`): the Team page's code, the
 * staff phone typing it in, the Scanner ready; then what the team can do.
 */
export function TeamStrip() {
  const { eyebrow, title, lead, frames, facts } = MOBILE_SCANNER_PREVIEW.team;
  const pictures = [<TeamPageFrame key="team" />, <StaffPhoneFrame key="staff" />, <ScannerReadyFrame key="ready" />];

  return (
    <LpSection section="team" eyebrow={eyebrow} title={title} lead={lead} align="center">
      <div className="relative">
        <DashedRail className="top-[18px] left-[16.67%] right-[16.67%] max-lg:hidden" />
        <ol className="grid gap-14 lg:grid-cols-3 lg:gap-8">
          {pictures.map((picture, index) => (
            <li key={frames[index]} data-frame={index + 1} className="relative pl-12 lg:pl-0 lg:text-center">
              {index < pictures.length - 1 && <DashedRail className="top-12 -bottom-[54px] left-[17px] lg:hidden" />}
              <span aria-hidden className="absolute top-0 left-0 flex rounded-full bg-[var(--cream)] lg:static lg:mx-auto lg:w-fit">
                <NumberStamp number={index + 1} size={36} color="var(--accent)" />
              </span>
              <p className="text-xl leading-9 font-bold text-[var(--foreground)] lg:mt-3 lg:leading-tight">{frames[index]}</p>
              <div className="mt-4 lg:flex lg:justify-center">{picture}</div>
            </li>
          ))}
        </ol>
      </div>
      <ul className="mx-auto mt-14 grid max-w-4xl gap-4 border-t border-[var(--border)] pt-8 lg:grid-cols-3 lg:gap-10">
        {facts.map((fact) => (
          <li key={fact.text} className="flex items-start gap-3 text-base text-[var(--foreground)]">
            <CheckIcon size={20} weight="bold" aria-hidden className="mt-0.5 shrink-0 text-[var(--accent)]" />
            <span className="flex min-w-0 flex-1 flex-col items-start gap-2">
              <span className="text-pretty">{fact.text}</span>
              {"plan" in fact && fact.plan && <PlanChip plan={fact.plan} />}
            </span>
          </li>
        ))}
      </ul>
    </LpSection>
  );
}
