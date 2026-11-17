import type { ReactNode } from "react";

/**
 * The cut at each height, plus the 24px of room above the device that `ROOM`
 * adds, so the visible cut stays where the height says.
 */
const CUT = {
  360: "max-h-[384px]",
  440: "max-h-[464px]",
  520: "max-h-[544px]",
} as const;

export type PhoneCropHeight = keyof typeof CUT;

/**
 * Room inside the cut for the device's drop shadow (16px a side, 24px above),
 * given back by negative margins so nothing moves: without it the clip edge
 * shows as a faint lighter box around the phone.
 */
const ROOM = "-mx-4 -mt-6 px-4 pt-6 lg:mx-0 lg:mt-0 lg:px-0 lg:pt-0";

/** The fade at the cut, and whole again from `lg`. */
const FADE =
  "overflow-hidden [mask-image:linear-gradient(to_bottom,#000_84%,transparent)] lg:max-h-none lg:overflow-visible lg:[mask-image:none]";

/**
 * The classes of a cut at `height` px, for a component that takes a class for its phone. The element must not set
 * its own width or margins below `lg`: the room for the shadow is negative margins.
 */
export function phoneCropClass(height: PhoneCropHeight = 440): string {
  return `${CUT[height]} ${ROOM} ${FADE}`;
}

/** A tall device cut at `height` px on a phone, fading into the page; whole from `lg`. */
export function PhoneCrop({ children, height = 440 }: Readonly<{ children: ReactNode; height?: PhoneCropHeight }>) {
  return (
    <div className={`flex ${CUT[height]} w-[calc(100%+2rem)] justify-center lg:w-full ${ROOM} ${FADE}`}>
      {children}
    </div>
  );
}
