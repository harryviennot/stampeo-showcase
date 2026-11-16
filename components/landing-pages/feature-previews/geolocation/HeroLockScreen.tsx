import { InkArrow, InkNote } from "@/components/ui/InkAnnotation";
import { ScaledBox } from "@/components/ui/ScaledBox";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { iphoneLayout } from "@/lib/devices/iphone";
import { GEOLOCATION_PREVIEW as COPY } from "@/lib/landing-pages/copy/previews/geolocation";
import { Chip } from "../../shared/Chip";
import { LockScreenPhone } from "./LockScreenPhone";

/** The phone is drawn 280px wide and shown 240px wide on a phone. */
const PHONE = { drawn: 280, narrowTo: 240 } as const;

/**
 * The phone's cut on a phone: 48px of room at each side and 24px above for its shadow (the top margin gives the
 * 24px back), cut at 400px, and fading out under the notification. From `lg` the phone is whole.
 */
const CUT =
  "-mt-6 flex max-h-[424px] justify-center overflow-hidden px-12 pt-6 [mask-image:linear-gradient(to_bottom,#000_76%,transparent)] lg:mt-0 lg:max-h-none lg:overflow-visible lg:px-0 lg:pt-0 lg:[mask-image:none]";

/**
 * The hero's picture: one still lock screen with Aurevo's "nearby" notification, cut on a phone and whole from
 * `lg`. "Coming soon" is a chip under it below `xl`, and a handwritten note to its left from `xl`.
 */
export function HeroLockScreen() {
  return (
    <ScrollReveal className="relative flex w-full flex-col items-center">
      <div className={CUT}>
        <div role="img" aria-label={COPY.hero.alt}>
          <ScaledBox width={PHONE.drawn} height={iphoneLayout(PHONE.drawn).height} narrowTo={PHONE.narrowTo}>
            <LockScreenPhone width={PHONE.drawn} eager />
          </ScaledBox>
        </div>
      </div>

      <Chip className="mt-3 xl:hidden">{COPY.heroChip}</Chip>

      <div className="pointer-events-none absolute top-[22%] left-[3%] hidden flex-col items-start xl:flex">
        <InkNote rotate={-3} className="whitespace-nowrap">
          {COPY.heroNote}
        </InkNote>
        <InkArrow variant="downRight" className="mt-0.5 ml-10 w-9" delay={0.5} />
      </div>
    </ScrollReveal>
  );
}
