import type { ReactNode } from "react";

/**
 * A tall device cut at 440px on a phone, where its clock, banners and numbers
 * sit in the top half. The cut fades into the page, and `flush` pulls it down
 * onto the section's bottom edge (cancelling the section's `pb-16`) so the
 * phone rises out of the next block instead of floating above a gap. From `lg`
 * the device is whole and sits in the middle of its column. The box is wider
 * than the phone so its shadow is not clipped.
 */
export function CroppedPhone({ flush = false, children }: Readonly<{ flush?: boolean; children: ReactNode }>) {
  return (
    <div
      className={`flex max-h-[440px] w-full justify-center overflow-hidden [mask-image:linear-gradient(to_bottom,#000_84%,transparent)] lg:mx-auto lg:max-h-none lg:w-auto lg:overflow-visible lg:[mask-image:none] ${
        flush ? "-mb-16 lg:mb-0" : ""
      }`}
    >
      {children}
    </div>
  );
}
