import type { BlogPostMeta } from "@/lib/blog/types";

export function BlogHeader({ post }: { post: BlogPostMeta }) {
  return (
    <header className="mb-10">
      <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-4">
        <span className="px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-semibold text-xs">
          {post.category}
        </span>
        <span>{post.readingTime}</span>
      </div>
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 leading-tight">
        {post.title}
      </h1>
      <p className="text-lg text-[var(--muted-foreground)] mb-6">
        {post.description}
      </p>
      <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)]">
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
        <div className="flex flex-wrap gap-2 mt-4">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded-md bg-[var(--accent)]/5 text-[var(--muted-foreground)]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}
