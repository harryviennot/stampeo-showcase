import type { ComponentProps } from "react";
import { ScaledBox } from "@/components/ui/ScaledBox";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { iphoneLayout } from "@/lib/devices/iphone";
import { LockScreenNotification } from "../platform/LockScreenNotification";
import { LockScreenPhone } from "./LockScreenPhone";

const PHONE = { drawn: 280, narrowTo: 240 } as const;

/** On a phone the phone is cut short and fades out under the notification, with room around it for its shadow; from `lg` it is whole. */
const CUT =
  "-mt-6 flex max-h-[424px] justify-center overflow-hidden px-12 pt-6 [mask-image:linear-gradient(to_bottom,#000_76%,transparent)] lg:mt-0 lg:max-h-none lg:overflow-visible lg:px-0 lg:pt-0 lg:[mask-image:none]";

/** A feature hero's picture: one still lock screen with one notification, read out as `alt`. */
export function HeroLockScreen({
  alt,
  notification,
}: Readonly<{ alt: string; notification: ComponentProps<typeof LockScreenNotification> }>) {
  return (
    <ScrollReveal className="flex w-full flex-col items-center">
      <div className={CUT}>
        <div role="img" aria-label={alt}>
          <ScaledBox width={PHONE.drawn} height={iphoneLayout(PHONE.drawn).height} narrowTo={PHONE.narrowTo}>
            <LockScreenPhone width={PHONE.drawn} notification={notification} eager />
          </ScaledBox>
        </div>
      </div>
    </ScrollReveal>
  );
}
