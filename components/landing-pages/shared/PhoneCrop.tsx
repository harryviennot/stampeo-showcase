import type { ReactNode } from "react";

const CUT = {
  360: "max-h-[360px]",
  440: "max-h-[440px]",
  520: "max-h-[520px]",
  560: "max-h-[560px]",
} as const;

export type PhoneCropHeight = keyof typeof CUT;

/** The fade at the cut, and whole again from `lg`. */
const FADE =
  "overflow-hidden [mask-image:linear-gradient(to_bottom,#000_84%,transparent)] lg:max-h-none lg:overflow-visible lg:[mask-image:none]";

/** The classes of a cut at `height` px, for a component that takes a class for its phone. */
export function phoneCropClass(height: PhoneCropHeight = 440): string {
  return `${CUT[height]} ${FADE}`;
}

/** A tall device cut at `height` px on a phone, fading into the page; whole from `lg`. */
export function PhoneCrop({ children, height = 440 }: Readonly<{ children: ReactNode; height?: PhoneCropHeight }>) {
  return <div className={`flex ${CUT[height]} w-full justify-center ${FADE}`}>{children}</div>;
}
