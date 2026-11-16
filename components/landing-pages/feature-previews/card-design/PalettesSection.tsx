import { CARD_DESIGN_PREVIEW } from "@/lib/landing-pages/copy/previews/card-design";
import { LpSection } from "../../shared/LpSection";
import { PaletteStage } from "./PaletteStage";

/** A logo, the card it dresses and the five palettes the designer makes from it; picking is `PaletteStage`'s. */
export function PalettesSection() {
  const { eyebrow, title, lead, logoLabel, logoAlt, cardAlt, swatches } = CARD_DESIGN_PREVIEW.palettes;

  return (
    <LpSection section="palettes" eyebrow={eyebrow} title={title} lead={lead} align="center">
      <PaletteStage logoLabel={logoLabel} logoAlt={logoAlt} cardAlt={cardAlt} swatchNames={swatches} />
    </LpSection>
  );
}
