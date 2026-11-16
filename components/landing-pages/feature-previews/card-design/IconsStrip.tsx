import { Container } from "@/components/ui/Container";
import { CARD_DESIGN_PREVIEW } from "@/lib/landing-pages/copy/previews/card-design";
import { LpSection } from "../../shared/LpSection";
import { IconRows } from "./IconRows";

/**
 * The designer's stamp icons in two rows that drift past, edge to edge, under their count written by hand
 * and what it counts (no heading: the rows are the point).
 */
export function IconsStrip() {
  const { figure, alt } = CARD_DESIGN_PREVIEW.icons;

  return (
    <LpSection section="icons" bare>
      <section className="py-6 lg:py-10">
        <Container>
          <p className="mb-5 flex items-baseline justify-center gap-3">
            <span className="ink-figure -rotate-2" style={{ fontSize: "clamp(3rem, 2rem + 3vw, 4.5rem)" }}>
              {figure.value}
            </span>
            <span className="text-lead text-[var(--muted-foreground)]">{figure.label}</span>
          </p>
        </Container>
        <IconRows alt={alt} />
      </section>
    </LpSection>
  );
}
