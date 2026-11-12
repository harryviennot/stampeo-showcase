import { Container } from "@/components/ui/Container";

/** A thin rule between two sections, inside the page's column. */
export function Hairline() {
  return (
    <Container>
      <hr className="mx-auto max-w-[1200px] border-0 border-t border-[var(--border)]" />
    </Container>
  );
}
