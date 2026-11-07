import type { MDXComponents } from "mdx/types";
import { compileMDX } from "next-mdx-remote/rsc";
import type { ComponentProps, ReactNode } from "react";
import { CallToAction } from "@/components/blog/mdx/CallToAction";
import { mdxComponents as blogComponents } from "@/components/blog/mdx";
import { BlogLink } from "@/components/blog/mdx/BlogLink";
import { ChooseIf, ChooseIfPair } from "@/components/compare/ChooseIf";
import { ComparisonTable } from "@/components/compare/ComparisonTable";
import { Fact } from "@/components/compare/Fact";
import { Fit, FitList } from "@/components/compare/Fit";
import { PageSection } from "@/components/compare/PageSection";
import { PriceCard, PriceCardPair } from "@/components/compare/PriceCard";
import type { Side } from "@/components/compare/SideCard";
import { Strengths, StrengthsPair } from "@/components/compare/Strengths";
import { blogMdxOptions } from "@/lib/blog/mdx-options";
import { arrangeBody, splitVerdict } from "./body";
import { COPY } from "./copy";
import type { ComparisonView } from "./view";

type ViewForComponents = Pick<ComparisonView, "page" | "competitor" | "stampeo">;

/**
 * The blog's components plus the comparison ones, each bound to the page it
 * renders on. Only comparisons get these: the blog's own set is untouched.
 */
function comparisonComponents(view: ViewForComponents): MDXComponents {
  const { market } = view.page;
  const copy = COPY[market];
  const nameOf = (side: Side) => (side === "competitor" ? view.competitor.name : "Stampeo");

  return {
    ...blogComponents,
    a: (props: ComponentProps<"a">) => <BlogLink {...props} trackAs="comparison_link" />,
    Fact: ({ id }: { id: string }) => <Fact id={id} view={view} />,
    PageSection,
    ChooseIf: ({ side, title, children }: { side: Side; title?: string; children?: ReactNode }) => (
      <ChooseIf side={side} title={title} competitor={view.competitor.name} market={market}>
        {children}
      </ChooseIf>
    ),
    ChooseIfPair,
    PriceCard: ({ side, title, children }: { side: Side; title?: string; children?: ReactNode }) => (
      <PriceCard side={side} title={title} name={nameOf(side)}>
        {children}
      </PriceCard>
    ),
    PriceCardPair,
    Strengths: ({ side, title, children }: { side: Side; title?: string; children?: ReactNode }) => (
      <Strengths side={side} title={title}>
        {children}
      </Strengths>
    ),
    StrengthsPair,
    Fit: ({ side, shop, children }: { side: Side; shop: string; children?: ReactNode }) => (
      <Fit side={side} shop={shop} name={nameOf(side)}>
        {children}
      </Fit>
    ),
    FitList,
    ComparisonTable: () => <ComparisonTable view={view} />,
    CallToAction: ({ title, buttonText, href }: { title?: string; buttonText?: string; href?: string }) => (
      <CallToAction
        title={title ?? copy.cta.title}
        buttonText={buttonText ?? copy.cta.button}
        href={href}
        trackAs="comparison_cta"
      />
    ),
  };
}

/**
 * The page's MDX as two parts: the verdict (its first paragraph, when it opens
 * with one) and the body, arranged into sections with its side-by-side parts paired.
 */
export async function compileComparisonMDX(
  view: ViewForComponents,
): Promise<{ verdict: ReactNode | null; body: ReactNode }> {
  const components = comparisonComponents(view);
  const compile = async (source: string) => (await compileMDX({ source, components, options: blogMdxOptions })).content;

  const { verdict, rest } = splitVerdict(view.page.content);
  return {
    verdict: verdict === null ? null : await compile(verdict),
    body: await compile(arrangeBody(rest)),
  };
}
