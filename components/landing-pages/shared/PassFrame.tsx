import type { ReactNode } from "react";
import { ScaledCardWrapper } from "@/components/card/ScaledCardWrapper";
import { ScaledBox } from "./ScaledBox";

/** The width a card is laid out at: the narrowest where its QR block fits under the fields. */
const LAYOUT_WIDTH = 300;
/** `ScaledCardWrapper`'s default aspect ratio. */
const CARD_RATIO = 1.282;

/** A card laid out at `LAYOUT_WIDTH` and shrunk to `width` by a fixed CSS scale. */
export function PassFrame({ width, children }: Readonly<{ width: number; children: ReactNode }>) {
  return (
    <ScaledBox width={LAYOUT_WIDTH} height={LAYOUT_WIDTH * CARD_RATIO} to={width}>
      <ScaledCardWrapper baseWidth={LAYOUT_WIDTH}>{children}</ScaledCardWrapper>
    </ScaledBox>
  );
}
