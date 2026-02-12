import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { BlogPostMeta } from "@/lib/blog/types";

export function BlogCard({ post }: { post: BlogPostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-[var(--cream)] rounded-xl border border-white/50 overflow-hidden shadow-lg shadow-[var(--accent)]/5 transition-transform duration-300 hover:-translate-y-1"
    >
      {post.coverImage && (
        <div className="relative aspect-[16/9] overflow-hidden bg-[var(--accent)]/5">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="flex flex-col gap-3 p-6">
        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
          <span className="px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-semibold">
            {post.category}
          </span>
          <span>{post.readingTime}</span>
        </div>
        <h3 className="text-lg font-bold leading-tight group-hover:text-[var(--accent)] transition-colors">
          {post.title}
        </h3>
        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed line-clamp-2">
          {post.description}
        </p>
        <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)] mt-auto pt-2">
          <span>{post.author}</span>
          <span>·</span>
          <time dateTime={post.publishedAt}>
            {new Date(post.publishedAt).toLocaleDateString(post.locale, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        </div>
      </div>
    </Link>
  );
}
