import type { ReactNode } from "react";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { Footer } from "@/components/sections/Footer";
import { Header } from "@/components/sections/Header";
import { Container } from "@/components/ui/Container";
import type { HelpPage } from "@/lib/help/types";
import { HelpBadges } from "./HelpBadges";
import { HelpBreadcrumb } from "./HelpBreadcrumb";
import { RelatedPages } from "./RelatedPages";
import { StillStuck } from "./StillStuck";

/**
 * A help article: breadcrumb, title and badges, the body, Related and "Still
 * stuck?". On a desktop the section list sits beside the title, and only when
 * the page has enough sections to need one.
 */
export function HelpLayout({
  page,
  categoryName,
  related,
  showToc,
  children,
}: {
  page: HelpPage;
  categoryName: string;
  related: ReadonlyArray<{ slug: string; title: string }>;
  showToc: boolean;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--blog-bg)]">
      <Header />
      <main className="pb-20 pt-28 sm:pt-32">
        <Container>
          <HelpBreadcrumb categoryName={categoryName} />

          <div className="mt-4 lg:flex lg:gap-12">
            <aside className="hidden w-64 shrink-0 lg:block">
              {/* h2 only: Symptom titles are h3 and stay out of the list. */}
              {showToc && <TableOfContents selector="h2" />}
            </aside>

            <div className="min-w-0 flex-1 lg:max-w-[44rem]">
              <h1 className="text-h1 text-[var(--near-black)]">{page.title}</h1>
              <HelpBadges type={page.type} audience={page.audience} plans={page.plans} />

              <article className="help-prose prose blog-prose mt-6 max-w-none leading-[1.6] lg:prose-lg">
                {children}
              </article>

              <RelatedPages pages={related} />
              <StillStuck />
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </div>
  );
}
