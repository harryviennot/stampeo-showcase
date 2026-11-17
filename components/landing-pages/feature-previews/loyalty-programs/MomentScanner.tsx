import { IPhone } from "@/components/ui/IPhone";
import { ScaledBox } from "@/components/ui/ScaledBox";
import { iphoneLayout } from "@/lib/devices/iphone";
import { useLandingCopy } from "@/lib/landing-pages/copy/bundle";
import { LevelScreen, SHOP_BRAND } from "../mobile-scanner/CounterScreens";
import { APP } from "../mobile-scanner/appColors";

/** The phone is drawn 280px wide and shown 252px wide, its top only: the screen fades out under the button. */
const PHONE = { drawn: 280, shown: 252 } as const;

/** The Scanner app's level screen: Sophie at the barbershop's Silver and its perk to apply, on the top of a phone. */
export function MomentScanner() {
  const { levels } = useLandingCopy().previews.loyaltyPrograms.LOYALTY_PROGRAMS_PREVIEW;

  return (
    <div className="flex h-full justify-center overflow-hidden px-4 pt-8 [mask-image:linear-gradient(to_bottom,#000_78%,transparent)]">
      <ScaledBox width={PHONE.drawn} height={iphoneLayout(PHONE.drawn).height} to={PHONE.shown}>
        <IPhone width={PHONE.drawn} statusBar="light" screenBackground={APP.surface}>
          <div className="absolute inset-0 px-4" style={{ paddingTop: "calc(var(--iphone-safe-top) + 14px)" }}>
            <LevelScreen brand={SHOP_BRAND.gaspardGus} detail="3 / 5" perks={levels.ladder[1].perks} />
          </div>
        </IPhone>
      </ScaledBox>
    </div>
  );
}
