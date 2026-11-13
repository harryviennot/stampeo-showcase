"use client";

import { IconMarquee } from "@/components/features/design-de-carte/IconLibrarySection";
import { stampIcons, type StampIconType } from "@/components/onboarding/StampIconPicker";

/** The library's icons, alternate ones to each of the two rows, so the rows are the same length and share none. */
export function iconRows(): [StampIconType[], StampIconType[]] {
  const ids = stampIcons.map((icon) => icon.id);

  return [ids.filter((_, index) => index % 2 === 0), ids.filter((_, index) => index % 2 === 1)];
}

/** Soft edges on both sides, whatever the page behind. */
const EDGE_FADE = "[mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]";
/** The two rows of icon tiles, drifting in opposite directions from one edge of the screen to the other. */
export function IconRows({ alt }: Readonly<{ alt: string }>) {
  const [first, second] = iconRows();

  return (
    <div role="img" aria-label={alt} className={EDGE_FADE}>
      <IconMarquee icons={first} colorOffset={0} duration={70} stillWhenReduced />
      <IconMarquee icons={second} colorOffset={3} reverse duration={85} stillWhenReduced />
    </div>
  );
}
