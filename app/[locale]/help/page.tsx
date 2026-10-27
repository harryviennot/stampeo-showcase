import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { HELP_LOCALES, helpRobots, isHelpLocale } from "@/lib/help/config";
import { getHelpCategories, getPagesInCategory } from "@/lib/help/index";

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

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-h1 mb-4">{t("title")}</h1>
          <p className="text-lead text-[var(--muted-foreground)] leading-relaxed">{t("building")}</p>

          {/* Every page, until the home is designed. Plain anchors: help links keep no locale prefix. */}
          <h2 className="text-h3 mt-10 mb-4">{t("allPages")}</h2>
          {getHelpCategories().map((category) => (
            <section key={category.slug} className="mb-6">
              <h3 className="font-semibold">{category.name}</h3>
              <ul className="mt-1">
                {getPagesInCategory(category.slug).map((page) => (
                  <li key={page.slug}>
                    <a
                      href={`/help/${page.slug}`}
                      className="inline-flex min-h-11 items-center text-[var(--accent)] hover:underline"
                    >
                      {page.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
