import type { ReactNode } from "react";
import { Heading } from "@/components/blog/mdx/Heading";
import { FeatureCTA } from "@/components/features/FeatureCTA";
import { CalendarCheckIcon } from "@/components/icons";
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
  /** The compiled MDX, already cut into sections. */
  body: ReactNode;
  others: readonly OtherComparison[];
  /** Stampeo's own card stack, drawn beside the title. */
  heroVisual?: ReactNode;
}

/** The title, verdict, check date and card stack, the written comparison in sections, then FAQ, sources, other comparisons and the closing call to action, with the structured data. */
export function ComparisonArticle({ view, verdict, body, others, heroVisual }: ComparisonArticleProps) {
  const { page, competitor, checkedAt } = view;
  const copy = COPY[page.market];

  return (
    <main>
      {comparisonJsonLd(page, checkedAt).map((node, index) => (
        <JsonLd key={index} data={node} />
      ))}

      <section className="pt-32 lg:pt-40">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
            <header className="max-w-[46rem]">
              <h1 className="text-h1 text-[var(--near-black)]">{copy.h1(competitor.name)}</h1>
              {verdict && <div className="mt-5 text-lead text-[var(--near-black)]/85 [&>p]:m-0">{verdict}</div>}
              <p className="mt-6 inline-flex h-8 items-center gap-2 rounded-full border border-[var(--border)] bg-white px-3 text-sm text-[var(--muted-foreground)]">
                <CalendarCheckIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
                {copy.checked(formatDate(checkedAt, page.market))}
              </p>
            </header>
            {heroVisual && <div className="mx-auto w-[200px] lg:mx-0 lg:w-auto lg:pr-20">{heroVisual}</div>}
          </div>
        </Container>
      </section>

      {body}

      <Container className="pb-16 lg:pb-24">
        <div className="max-w-[46rem]">
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
        </div>
      </Container>

      <FeatureCTA title={copy.closing.title} subtitle={copy.closing.subtitle} trackAs="comparison_final_cta" />
    </main>
  );
}
