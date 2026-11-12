import type { ReactNode } from "react";

/** A tall device cut at 440px on a phone, fading into the page; whole from `lg`. */
export function PhoneCrop({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="flex max-h-[440px] w-full justify-center overflow-hidden [mask-image:linear-gradient(to_bottom,#000_84%,transparent)] lg:max-h-none lg:overflow-visible lg:[mask-image:none]">
      {children}
    </div>
  );
}
