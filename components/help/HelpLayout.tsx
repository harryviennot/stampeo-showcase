import type { ReactNode } from "react";
import { TableOfContents } from "@/components/blog/TableOfContents";
import type { TocPlacement } from "@/lib/help/toc";
import type { HelpPage } from "@/lib/help/types";
import { HelpBadges } from "./HelpBadges";
import { HelpBreadcrumb } from "./HelpBreadcrumb";
import { HelpGrid } from "./HelpGrid";
import { HelpPageShell } from "./HelpPageShell";
import { PhoneToc } from "./PhoneToc";
import { RelatedPages } from "./RelatedPages";
import { StillStuck } from "./StillStuck";

/**
 * A help article: breadcrumb with the Search pill, title and badges, the body,
 * then Related and "Still stuck?" under a rule. The section list sits in the
 * right rail on a desktop and folded above the body on a phone, each only
 * where `toc` says.
 */
export function HelpLayout({
  page,
  categoryName,
  related,
  toc,
  children,
}: {
  page: HelpPage;
  categoryName: string;
  related: ReadonlyArray<{ slug: string; title: string }>;
  toc: TocPlacement;
  children: ReactNode;
}) {
  return (
    <HelpPageShell>
      <HelpGrid
        top={<HelpBreadcrumb categoryName={categoryName} categorySlug={page.category} />}
        // h2 only: Symptom titles are h3 and stay out of the list.
        rail={toc.desktop ? <TableOfContents selector="h2" /> : null}
      >
        <h1 className="text-h1 mt-4 text-[var(--near-black)]">{page.title}</h1>
        <HelpBadges type={page.type} audience={page.audience} plans={page.plans} />
        {toc.phone && <PhoneToc />}

        <article
          className={`help-prose prose blog-prose mt-6 max-w-none leading-[1.6] lg:prose-lg ${
            page.type === "how-to" ? "help-steps" : ""
          }`}
        >
          {children}
        </article>

        <div className="mt-14 border-t border-[var(--border)] pt-10">
          <RelatedPages pages={related} />
          <StillStuck className={related.length > 0 ? "mt-10" : ""} />
        </div>
      </HelpGrid>
    </HelpPageShell>
  );
}
