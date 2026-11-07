import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

/**
 * How wide a section's blocks run. A plain section is a reading column centered
 * in the Container, except the "Choose X if" pair, which keeps the full width.
 * A band keeps its title and prose on the Container's left edge, above the
 * table or the strengths that use all of it.
 */
const COLUMN = {
  plain: "[&>div>:not([data-choose-if-pair])]:mx-auto [&>div>:not([data-choose-if-pair])]:max-w-[46rem] lg:[&>div>h2]:mt-16",
  band: "[&>div>:is(h2,h3,p,ul,ol,blockquote)]:max-w-[46rem]",
} as const;

/** One section of a comparison: a plain stretch of the paper page, or a band across its full width. */
export function PageSection({ tone, children }: { tone: "plain" | "band"; children: ReactNode }) {
  return (
    <section data-section={tone} className={tone === "band" ? "bg-[var(--blog-bg)]" : undefined}>
      <Container className="py-16 lg:py-24">
        {/* The inner div keeps the blog's "first paragraph is larger" rule off a section's first paragraph. */}
        <div className={`prose prose-lg blog-prose max-w-none leading-[1.6] ${COLUMN[tone]} [&>div>h2]:text-balance [&>div>h2:first-child]:mt-0`}>
          <div>{children}</div>
        </div>
      </Container>
    </section>
  );
}
