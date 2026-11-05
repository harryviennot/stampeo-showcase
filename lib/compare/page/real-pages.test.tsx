import { afterAll, describe, expect, it, mock } from "bun:test";
import { NextIntlClientProvider } from "next-intl";
import { renderToStaticMarkup } from "react-dom/server";
import { ComparisonArticle } from "@/components/compare/ComparisonArticle";
import { FALLBACK_PRICING } from "@/lib/pricing";
import { loadCatalog } from "@/lib/testing/catalogs";
import { allComparisonPages } from "../content";
import { buildStampeoColumn } from "../stampeo";
import { otherComparisons, loadComparison } from "./load";
import { compileComparisonMDX } from "./mdx";

// Clicks need a Next request to be tracked; this test is about the words on the page.
const realTracking = await import("@/hooks/use-cta-tracking");
mock.module("@/hooks/use-cta-tracking", () => ({ useCtaTracking: () => () => {} }));
afterAll(() => mock.module("@/hooks/use-cta-tracking", () => realTracking));

describe.each(allComparisonPages().map((page) => [`${page.locale}/${page.slug}`, page] as const))(
  "the page content/compare/%s",
  (_file, page) => {
    it("compiles and renders, every <Fact> resolved, with its table, sources and FAQ", async () => {
      const loaded = loadComparison(page)!;
      const pricing = page.market === "fr" ? FALLBACK_PRICING.eur : FALLBACK_PRICING.usd;
      const view = { ...loaded, stampeo: buildStampeoColumn(page.market, pricing) };
      const { verdict, body } = await compileComparisonMDX(view);

      const html = renderToStaticMarkup(
        <NextIntlClientProvider locale={page.locale} messages={loadCatalog(page.locale)} timeZone="UTC">
          <ComparisonArticle view={view} verdict={verdict} body={body} others={otherComparisons(view)} />
        </NextIntlClientProvider>,
      );

      expect(html).toContain("<table");
      expect(html).toContain('id="sources"');
      expect(html).toContain('id="faq"');
      expect(html).not.toMatch(/undefined|\[object|<Fact|\{\{/);
    });
  },
);
