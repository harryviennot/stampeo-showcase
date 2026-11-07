import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

/**
 * One section of a comparison: a plain stretch of the paper page, or a band
 * across its full width. Prose keeps a reading width on the Container's left
 * edge; the cards and the table inside use all of it.
 */
export function PageSection({ tone, children }: { tone: "plain" | "band"; children: ReactNode }) {
  return (
    <section data-section={tone} className={tone === "band" ? "bg-[var(--blog-bg)]" : undefined}>
      <Container className="py-16 lg:py-24">
        {/* The inner div keeps the blog's "first paragraph is larger" rule off a section's first paragraph. */}
        <div className="prose prose-lg blog-prose max-w-none leading-[1.6] [&>div>:is(h2,h3,p,ul,ol,blockquote)]:max-w-[46rem] [&>div>h2:first-child]:mt-0">
          <div>{children}</div>
        </div>
      </Container>
    </section>
  );
}
