import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { BlogPostMeta } from "@/lib/blog/types";

/** `rich` adds the reading time beside the category and a two-line excerpt under the title, which it balances. */
export function BlogCard({ post, detail = "default" }: { post: BlogPostMeta; detail?: "default" | "rich" }) {
  const t = useTranslations("blog");
  const rich = detail === "rich";

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden blog-card-3d"
    >
      {post.coverImage && (
        <div className="relative aspect-[16/9] overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-[var(--accent)] text-white font-semibold">
            {post.category}
          </span>
          {rich && (
            <span className="px-2.5 py-1 rounded-full bg-[var(--background-subtle)] ring-1 ring-inset ring-[var(--border)] text-[var(--foreground)] font-semibold">
              {t("readingTime", { minutes: post.readingMinutes })}
            </span>
          )}
        </div>
        <h3
          className={
            rich
              ? "text-lg font-bold leading-tight text-balance group-hover:text-[var(--accent)] transition-colors"
              : "text-lg font-bold leading-tight group-hover:text-[var(--accent)] transition-colors"
          }
        >
          {post.title}
        </h3>
        {rich && (
          <p className="line-clamp-2 text-sm text-[var(--muted-foreground)]">{post.description}</p>
        )}
        <time
          dateTime={post.publishedAt}
          className="text-xs text-[var(--muted-foreground)] mt-auto"
        >
          {new Date(post.publishedAt).toLocaleDateString(post.locale, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </div>
    </Link>
  );
}
