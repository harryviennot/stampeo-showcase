import type { ReactNode } from "react";

/**
 * A tall device cut at 440px on a phone, where its clock, banners and numbers
 * sit in the top half. The cut fades into the page, and the box spans the
 * column (wider than the phone) so the shadow is not clipped at the sides. From
 * `lg` the device is whole.
 */
export function PhoneCrop({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex max-h-[440px] w-full justify-center overflow-hidden [mask-image:linear-gradient(to_bottom,#000_84%,transparent)] lg:max-h-none lg:overflow-visible lg:[mask-image:none]">
      {children}
    </div>
  );
}
