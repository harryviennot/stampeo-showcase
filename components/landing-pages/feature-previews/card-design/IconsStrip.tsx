import { Container } from "@/components/ui/Container";
import { CARD_DESIGN_PREVIEW } from "@/lib/landing-pages/copy/previews/card-design";
import { EYEBROW, LpSection } from "../../shared/LpSection";
import { IconRows } from "./IconRows";

/**
 * "An icon for every trade": the designer's stamp icons in two rows that drift
 * past, edge to edge under a small label (no heading: the rows are the point).
 */
export function IconsStrip() {
  const { label, alt } = CARD_DESIGN_PREVIEW.icons;

  return (
    <LpSection section="icons" bare>
      <section className="py-6 lg:py-10">
        <Container>
          <p className={`mb-5 text-center ${EYEBROW} text-[var(--muted-foreground)]`}>{label}</p>
        </Container>
        <IconRows alt={alt} />
      </section>
    </LpSection>
  );
}
