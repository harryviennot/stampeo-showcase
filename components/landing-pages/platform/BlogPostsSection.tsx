import { ArrowRightIcon } from "@/components/icons";
import { BlogCard } from "@/components/blog/BlogCard";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getAllPosts } from "@/lib/blog";
import { hasBlog } from "@/lib/blog/locales";
import { useLandingCopy } from "@/lib/landing-pages/copy/bundle";
import { LpHeading, LpSection } from "../shared/LpSection";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

/**
 * "Guides for shop owners": the three latest posts of the page's language as rich
 * cards (the reading time and a two-line excerpt), each linking to its post, and a
 * link to the whole blog. The header is left-aligned, with the link on its right.
 * A language with no blog has no section.
 */
export function BlogPostsSection() {
  const locale = useLocale();
  const { PLATFORM } = useLandingCopy().platform;
  const posts = getAllPosts(locale).slice(0, 3);

  if (!hasBlog(locale)) return null;

  return (
    <LpSection section="blog">
      <ScrollReveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <LpHeading eyebrow={PLATFORM.blog.eyebrow} title={PLATFORM.blog.title} lead={PLATFORM.blog.lead} />
        <Link
          href="/blog"
          className="inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-full border-2 border-[var(--foreground)] px-5 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--foreground)] hover:text-white md:self-auto"
        >
          {PLATFORM.blog.viewAll}
          <ArrowRightIcon size={16} weight="bold" aria-hidden />
        </Link>
      </ScrollReveal>

      <ScrollReveal delay={120} className="mt-8 lg:mt-14">
        <ul className="grid gap-4 md:grid-cols-3 lg:gap-6">
          {posts.map((post) => (
            <li key={post.slug} className="flex [&>a]:w-full">
              <BlogCard post={post} detail="rich" />
            </li>
          ))}
        </ul>
      </ScrollReveal>
    </LpSection>
  );
}
