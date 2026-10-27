import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HelpDoors } from "@/components/help/HelpDoors";
import { HelpPageList } from "@/components/help/HelpPageList";
import { HelpPageShell } from "@/components/help/HelpPageShell";
import { HelpTopicCards } from "@/components/help/HelpTopicCards";
import { StillStuck } from "@/components/help/StillStuck";
import { HelpHomeSearch } from "@/components/help/search/HelpHomeSearch";
import { Container } from "@/components/ui/Container";
import { HELP_LOCALES, helpRobots, isHelpLocale } from "@/lib/help/config";
import { getAllHelpPages } from "@/lib/help/index";
import { popularSlugs } from "@/lib/help/home/popular";
import { groupTopics, homeTopics, visibleDoors } from "@/lib/help/home/topics";

// English only: any other locale answers 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return HELP_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isHelpLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "help.home" });

  // No canonical and no hreflang: a noindex page names no preferred URL.
  return { title: t("title"), robots: helpRobots() };
}

export default async function HelpHomePage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isHelpLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("help.home");

  const pages = getAllHelpPages();
  const topics = groupTopics(pages);
  const bySlug = new Map(pages.map((page) => [page.slug, page]));
  const popular = popularSlugs(bySlug.keys(), 8).map((slug) => ({
    href: `/help/${slug}`,
    title: bySlug.get(slug)!.title,
  }));
  // Two lists side by side on a desktop; on a phone they stack into one surface.
  const half = Math.ceil(popular.length / 2);

  return (
    <HelpPageShell>
      <Container>
        <h1 className="text-h1 text-center text-[var(--near-black)]">{t("title")}</h1>
        <div className="mx-auto mt-6 max-w-[40rem]">
          <HelpHomeSearch />
        </div>

        <div className="mt-8 lg:mt-12">
          <HelpDoors doors={visibleDoors(topics)} />
        </div>

        {popular.length > 0 && (
          <section aria-labelledby="help-popular" className="mt-10 lg:mt-14">
            <h2 id="help-popular" className="text-h3 mb-3 text-[var(--near-black)] md:mb-4">
              {t("popular")}
            </h2>
            <div className="md:grid md:grid-cols-2 md:gap-6">
              <HelpPageList items={popular.slice(0, half)} className="max-md:rounded-b-none max-md:border-b-0" />
              <HelpPageList items={popular.slice(half)} className="max-md:rounded-t-none" />
            </div>
          </section>
        )}

        <div className="mt-10 lg:mt-14">
          <HelpTopicCards topics={homeTopics(topics)} />
        </div>

        <StillStuck className="mt-10 lg:mt-14" />
      </Container>
    </HelpPageShell>
  );
}
