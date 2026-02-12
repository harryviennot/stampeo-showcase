import type { BlogPostMeta } from "@/lib/blog/types";

export function BlogHeader({ post }: { post: BlogPostMeta }) {
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
          {post.readingTime}
        </span>
      </div>
      <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 leading-[1.1]">
        {post.title}
      </h1>
      <p className="text-lg md:text-xl text-[var(--muted-foreground)] mb-6 leading-relaxed">
        {post.description}
      </p>
      <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
        <div className="w-9 h-9 rounded-full bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] font-bold text-xs">
          {initials}
        </div>
        <span className="font-semibold text-[var(--foreground)]">
          {post.author}
        </span>
        <span>·</span>
        <time dateTime={post.publishedAt}>
          {new Date(post.publishedAt).toLocaleDateString(post.locale, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
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
