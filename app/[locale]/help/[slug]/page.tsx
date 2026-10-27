import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { HelpLayout } from "@/components/help/HelpLayout";
import { ShareLayout } from "@/components/help/ShareLayout";
import { HELP_LOCALES, helpRobots, isHelpLocale } from "@/lib/help/config";
import { getHelpCategory } from "@/lib/help/categories";
import { getAllHelpPages, getHelpPage } from "@/lib/help/index";
import { layoutFor } from "@/lib/help/share/layout-for";
import { compileHelpMDX } from "@/lib/help/mdx";
import { tocPlacement } from "@/lib/help/toc";

// English only, and only the pages that exist: any other slug answers 404.
export const dynamicParams = false;

export function generateStaticParams() {
  const slugs = getAllHelpPages().map((page) => page.slug);
  return HELP_LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  // No canonical and no hreflang: a noindex page names no preferred URL.
  const noindex = { robots: helpRobots() };
  if (!isHelpLocale(locale)) return noindex;

  const page = getHelpPage(slug);
  if (!page) return noindex;

  return { title: page.title, description: page.description, ...noindex };
}

export default async function HelpArticlePage({
  params,
}: Readonly<{
  params: Promise<{ locale: string; slug: string }>;
}>) {
  const { locale, slug } = await params;
  if (!isHelpLocale(locale)) notFound();

  const page = getHelpPage(slug);
  if (!page) notFound();
  setRequestLocale(locale);

  const content = await compileHelpMDX(page.content);
  if (layoutFor(page.type) === "share") return <ShareLayout page={page}>{content}</ShareLayout>;

  const related = page.related.map((relatedSlug) => {
    const target = getHelpPage(relatedSlug);
    if (!target) throw new Error(`${page.filePath}: related page "${relatedSlug}" does not exist`);
    return { slug: target.slug, title: target.title };
  });

  return (
    <HelpLayout
      page={page}
      categoryName={getHelpCategory(page.category)?.name ?? page.category}
      related={related}
      toc={tocPlacement(page.content, page.type)}
    >
      {content}
    </HelpLayout>
  );
}
