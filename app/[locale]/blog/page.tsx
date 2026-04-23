import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { BlogCard } from "@/components/blog/BlogCard";
import { FeaturedHeroCard } from "@/components/blog/FeaturedHeroCard";
import { JsonLd } from "@/components/JsonLd";
import { collectionPageJsonLd } from "@/lib/structured-data";
import { getAllPosts } from "@/lib/blog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "fr" && locale !== "en") return {};
  const t = await getTranslations({ locale, namespace: "blog" });
  return {
    title: t("metaTitle"),
    description: t("description"),
    alternates: {
      canonical: locale === "fr" ? "/blog" : `/${locale}/blog`,
      languages: {
        "x-default": "/blog",
        fr: "/blog",
        en: "/en/blog",
      },
    },
  };
}

export default async function BlogPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (locale !== "fr" && locale !== "en") {
    redirect("/blog");
  }
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const posts = getAllPosts(locale);

  const featured = posts.filter((p) => p.featured);
  const rest = posts.filter((p) => !p.featured);

  const [heroPost, ...otherFeatured] = featured;

  return (
    <div className="min-h-screen bg-[var(--blog-bg)]">
      <JsonLd
        data={collectionPageJsonLd({
          name: t("title"),
          description: t("description"),
          locale,
          posts: posts.map((p) => ({
            title: p.title,
            description: p.description,
            slug: p.slug,
            publishedAt: p.publishedAt,
          })),
        })}
      />
      <Header />
      <main className="pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-[var(--near-black)]">
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
