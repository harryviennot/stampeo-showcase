import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return {
    title: t("title"),
    description: t("hero.description"),
    alternates: {
      canonical: locale === "fr" ? "/about" : `/${locale}/about`,
      languages: { fr: "/about", en: "/en/about" },
    },
  };
}

export default async function AboutPage() {
  const t = await getTranslations("about");
  const values = t.raw("values.items") as Array<{
    title: string;
    description: string;
  }>;
  const storyParagraphs = t.raw("story.paragraphs") as string[];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="pt-32 pb-20">
        <div className="max-w-3xl mx-auto px-6">
          {/* Hero */}
          <div className="mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-semibold mb-4">
              {t("hero.badge")}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              {t("hero.headline")}
            </h1>
            <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
              {t("hero.description")}
            </p>
          </div>

          {/* Mission */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-3">{t("mission.title")}</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              {t("mission.description")}
            </p>
          </section>

          {/* Values */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-8">{t("values.title")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="p-6 bg-[var(--cream)] rounded-xl border border-white/50"
                >
                  <h3 className="text-lg font-bold mb-2">{value.title}</h3>
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Story */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold mb-4">{t("story.title")}</h2>
            <div className="space-y-4">
              {storyParagraphs.map((paragraph, i) => (
                <p
                  key={i}
                  className="text-[var(--muted-foreground)] leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-12 px-8 bg-[var(--cream)] rounded-2xl border border-white/50">
            <h2 className="text-2xl font-bold mb-2">{t("cta.title")}</h2>
            <p className="text-[var(--muted-foreground)] mb-6">
              {t("cta.description")}
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center h-12 px-8 bg-[var(--accent)] text-white text-sm font-bold rounded-xl hover:brightness-110 shadow-lg shadow-[var(--accent)]/20 transition-all"
            >
              {t("cta.button")}
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
