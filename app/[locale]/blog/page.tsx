import { getLocale, getTranslations } from "next-intl/server";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { BlogCard } from "@/components/blog/BlogCard";
import { FeaturedHeroCard } from "@/components/blog/FeaturedHeroCard";
import { getAllPosts } from "@/lib/blog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: locale === "fr" ? "/blog" : `/${locale}/blog`,
      languages: { fr: "/blog", en: "/en/blog" },
    },
  };
}

export default async function BlogPage() {
  const locale = await getLocale();
  const t = await getTranslations("blog");
  const posts = getAllPosts(locale);

  const featured = posts.filter((p) => p.featured);
  const rest = posts.filter((p) => !p.featured);

  const [heroPost, ...otherFeatured] = featured;

  return (
    <div className="min-h-screen bg-[var(--blog-bg)]">
      <Header />
      <main className="pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              {t("title")}
            </h1>
            <p className="text-lg text-[var(--muted-foreground)] max-w-2xl mx-auto">
              {t("description")}
            </p>
          </div>

          {posts.length === 0 ? (
            <p className="text-center text-[var(--muted-foreground)] py-20">
              {t("noPostsYet")}
            </p>
          ) : (
            <>
              {/* Featured posts */}
              {featured.length > 0 && (
                <section className="mb-16">
                  <h2 className="text-sm font-bold text-[var(--accent)] uppercase tracking-wider mb-6">
                    {t("featured")}
                  </h2>

                  {/* Hero featured card */}
                  {heroPost && (
                    <div className="mb-6">
                      <FeaturedHeroCard post={heroPost} />
                    </div>
                  )}

                  {/* Other featured in 2-col grid */}
                  {otherFeatured.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {otherFeatured.map((post) => (
                        <BlogCard key={post.slug} post={post} />
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* All posts */}
              {rest.length > 0 && (
                <section>
                  <h2 className="text-sm font-bold text-[var(--accent)] uppercase tracking-wider mb-6">
                    {t("allPosts")}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rest.map((post) => (
                      <BlogCard key={post.slug} post={post} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
