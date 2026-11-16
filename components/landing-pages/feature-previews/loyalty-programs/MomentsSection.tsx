import { LOYALTY_PROGRAMS_PREVIEW } from "@/lib/landing-pages/copy/previews/loyalty-programs";
import { CARD_SHADOW, CARD_TITLE } from "../../platform/classes";
import { LpSection } from "../../shared/LpSection";
import { MomentLockScreen } from "./MomentLockScreen";
import { MomentPicture } from "./MomentPicture";
import { MomentScanner } from "./MomentScanner";
import { SignupLevels } from "./SignupLevels";

const CARD = `flex flex-col rounded-[28px] bg-white p-5 ${CARD_SHADOW} ring-1 ring-black/5`;

/** Three white cards, each with a picture of where the levels show: the sign-up page, the lock screen and the Scanner app. */
export function MomentsSection() {
  const { eyebrow, title, lead, signup, lockScreen, scanner, alts } = LOYALTY_PROGRAMS_PREVIEW.moments;
  const moments = [
    { ...signup, alt: alts[0], picture: <SignupLevels /> },
    { ...lockScreen, alt: alts[1], picture: <MomentLockScreen banner={lockScreen.banner} /> },
    { ...scanner, alt: alts[2], picture: <MomentScanner /> },
  ];

  return (
    <LpSection section="moments" eyebrow={eyebrow} title={title} lead={lead} align="center">
      <ul className="mx-auto grid max-w-[480px] gap-5 text-left lg:max-w-[1040px] lg:grid-cols-3 lg:gap-6">
        {moments.map((moment) => (
          <li key={moment.title} className={CARD}>
            <MomentPicture alt={moment.alt}>{moment.picture}</MomentPicture>
            <h3 className={`${CARD_TITLE} mt-5 lg:text-[1.375rem]`}>{moment.title}</h3>
            <p className="mt-2 text-[15px] text-pretty text-[var(--muted-foreground)]">{moment.body}</p>
          </li>
        ))}
      </ul>
    </LpSection>
  );
}
