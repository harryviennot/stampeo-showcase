import { useTranslations } from "next-intl";
import type { BlogPostMeta } from "@/lib/blog/types";

const formatDate = (iso: string, locale: string) =>
  new Date(iso).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export function BlogHeader({ post }: { post: BlogPostMeta }) {
  const t = useTranslations("blog");
  const initials = post.author
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <header className="mb-10 pb-8 border-b border-[var(--border)]">
      <div className="flex items-center gap-2 text-sm mb-4">
        <span className="px-3 py-1 rounded-full bg-[var(--accent)] text-white font-semibold text-xs">
          {post.category}
        </span>
        <span className="text-[var(--muted-foreground)]">
          {t("readingTime", { minutes: post.readingMinutes })}
        </span>
      </div>
      <h1 className="text-h1 mb-4 leading-[1.1] text-[var(--near-black)]">
        {post.title}
      </h1>
      <p className="text-lead text-[var(--muted-foreground)] mb-6 leading-relaxed">
        {post.description}
      </p>
      <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
        <div className="w-9 h-9 shrink-0 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] font-bold text-xs">
          {initials}
        </div>
        {/* Below md the name and each date take a line beside the avatar, as
            in AuthorCard; from md they share one row. */}
        <div className="flex flex-col md:flex-row md:items-center md:gap-3">
          <span className="font-semibold text-[var(--foreground)]">
            {post.author}
          </span>
          <span aria-hidden className="hidden md:inline">·</span>
          <time dateTime={post.publishedAt}>
            {formatDate(post.publishedAt, post.locale)}
          </time>
          {post.updatedAt && post.updatedAt !== post.publishedAt && (
            <>
              <span aria-hidden className="hidden md:inline">·</span>
              <span>
                {t.rich("updatedOn", {
                  date: formatDate(post.updatedAt, post.locale),
                  time: (chunks) => <time dateTime={post.updatedAt}>{chunks}</time>,
                })}
              </span>
            </>
          )}
        </div>
      </div>
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-xs rounded-full bg-[var(--near-black)]/5 text-[var(--muted-foreground)] font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}
