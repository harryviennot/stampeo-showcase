import type { ReactNode } from "react";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { Heading } from "@/components/blog/mdx/Heading";
import { FeatureCTA } from "@/components/features/FeatureCTA";
import { JsonLd } from "@/components/JsonLd";
import { Container } from "@/components/ui/Container";
import { FAQList } from "@/components/ui/FAQList";
import { comparisonJsonLd } from "@/lib/compare/structured-data";
import { COPY } from "@/lib/compare/page/copy";
import { formatDate } from "@/lib/compare/page/format";
import type { OtherComparison } from "@/lib/compare/page/load";
import type { ComparisonView } from "@/lib/compare/page/view";
import { ComparisonLinks } from "./ComparisonLinks";
import { SourcesList } from "./SourcesList";

interface ComparisonArticleProps {
  view: ComparisonView;
  /** The compiled first paragraph, or null when the page opens on something else. */
  verdict: ReactNode;
  /** The rest of the compiled MDX. */
  body: ReactNode;
  others: readonly OtherComparison[];
}

/**
 * Everything between the header and the footer of a comparison page: the title,
 * the verdict, the date the facts were checked, the written comparison, the FAQ,
 * the sources, the other comparisons and the closing call to action. The
 * structured data renders with it, in the server HTML.
 *
 * There is no cover image, tag, reading time, share button, back link or author:
 * the page is Stampeo's own and says so in its sources.
 */
export function ComparisonArticle({ view, verdict, body, others }: ComparisonArticleProps) {
  const { page, competitor, checkedAt } = view;
  const copy = COPY[page.market];

  return (
    <main className="pt-32">
      {comparisonJsonLd(page, checkedAt).map((node, index) => (
        <JsonLd key={index} data={node} />
      ))}
      <Container>
        <div className="flex gap-12">
          <aside className="hidden w-64 shrink-0 lg:block">
            <TableOfContents />
          </aside>

          <article className="min-w-0 flex-1">
            <header className="max-w-[46rem]">
              <h1 className="text-h1 text-[var(--near-black)]">{copy.h1(competitor.name)}</h1>
              {verdict && <div className="mt-5 text-lead text-[var(--near-black)]/85 [&>p]:m-0">{verdict}</div>}
              <p className="mt-4 text-sm text-[var(--muted-foreground)]">{copy.checked(formatDate(checkedAt, page.market))}</p>
            </header>

            {/* The inner div keeps the blog's "first paragraph is larger" rule off the first paragraph of the body. */}
            <div className="prose prose-lg blog-prose mt-10 max-w-none leading-[1.6]">
              <div>{body}</div>
            </div>

            <section aria-labelledby="faq">
              <Heading level={2} id="faq">
                {copy.faqTitle}
              </Heading>
              <div className="mt-4">
                <FAQList items={page.faqs} />
              </div>
            </section>

            <SourcesList view={view} />
            <ComparisonLinks market={page.market} others={others} />
          </article>
        </div>
      </Container>

      <FeatureCTA title={copy.closing.title} subtitle={copy.closing.subtitle} trackAs="comparison_final_cta" />
    </main>
  );
}
