import type { MDXComponents } from "mdx/types";
import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactNode } from "react";
import { CallToAction } from "@/components/blog/mdx/CallToAction";
import { mdxComponents as blogComponents } from "@/components/blog/mdx";
import { ChooseIf, ChooseIfPair } from "@/components/compare/ChooseIf";
import { ComparisonTable } from "@/components/compare/ComparisonTable";
import { Fact } from "@/components/compare/Fact";
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

  return {
    ...blogComponents,
    Fact: ({ id }: { id: string }) => <Fact id={id} view={view} />,
    ChooseIf: ({ side, title, children }: { side: "competitor" | "stampeo"; title?: string; children?: ReactNode }) => (
      <ChooseIf side={side} title={title} competitor={view.competitor.name} market={market}>
        {children}
      </ChooseIf>
    ),
    ChooseIfPair,
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
 * with one) and the body, with the Choose if cards paired and a sign-up button
 * after them.
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
