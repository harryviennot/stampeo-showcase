import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ShareButtons } from "@/components/blog/ShareButtons";
import { AuthorCard } from "@/components/blog/AuthorCard";
import { RelatedPosts } from "@/components/blog/RelatedPosts";
import { JsonLd } from "@/components/JsonLd";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/structured-data";
import { getPostBySlug, getAllSlugs, getRelatedPosts } from "@/lib/blog";
import { compileBlogMDX } from "@/lib/blog/mdx";

export async function generateStaticParams() {
  const slugs = getAllSlugs("fr");
  return slugs.map((slug) => ({ locale: "fr", slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (locale !== "fr") return {};

  const post = getPostBySlug(slug, locale);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: [post.author],
      tags: post.tags,
    },
    alternates: {
      canonical: `/blog/${slug}`,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();

  if (locale !== "fr") {
    redirect(`/blog/${slug}`);
  }

  const t = await getTranslations("blog");

  const post = getPostBySlug(slug, locale);
  if (!post) notFound();

  const content = await compileBlogMDX(post.content);
  const related = getRelatedPosts(slug, locale, 3);

  return (
    <div className="min-h-screen bg-[var(--blog-bg)]">
      <JsonLd
        data={articleJsonLd({
          title: post.title,
          description: post.description,
          publishedAt: post.publishedAt,
          updatedAt: post.updatedAt,
          author: post.author,
          coverImage: post.coverImage,
          slug: post.slug,
          locale,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: t("title"), url: "/blog" },
          { name: post.title, url: `/blog/${slug}` },
        ])}
      />
      <Header />
      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors mb-8"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
            {t("backToBlog")}
          </Link>

          <BlogHeader post={post} />

          {/* Full-width hero image */}
          {post.coverImage && (
            <div className="relative w-full aspect-[2.2/1] rounded-2xl overflow-hidden mb-12 shadow-lg">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="flex gap-12">
            {/* TOC — left side */}
            <aside className="hidden lg:block w-64 shrink-0">
              <TableOfContents />
            </aside>

            {/* Article */}
            <div className="flex-1 min-w-0">
              <article className="prose prose-lg leading-[1.6] max-w-none blog-prose">
                {content}
              </article>

              {/* Share */}
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-[var(--border)]">
                <span className="text-sm font-semibold">{t("share")}</span>
                <ShareButtons
                  title={post.title}
                  slug={slug}
                  locale={locale}
                />
              </div>

              <AuthorCard name={post.author} />
            </div>
          </div>

          {/* Related posts */}
          <RelatedPosts posts={related} title={t("relatedPosts")} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
