import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { BlogPostMeta } from "@/lib/blog/types";

export function FeaturedHeroCard({ post }: { post: BlogPostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden blog-card-3d"
    >
      {post.coverImage && (
        <div className="relative md:w-1/2 aspect-[16/9] md:aspect-auto overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="flex flex-col justify-center gap-4 p-6 md:p-8 md:w-1/2">
        <span className="self-start px-3 py-1 rounded-full bg-[var(--accent)] text-white text-xs font-semibold">
          {post.category}
        </span>
        <h3 className="text-2xl md:text-3xl font-bold leading-tight group-hover:text-[var(--accent)] transition-colors">
          {post.title}
        </h3>
        <p className="text-[var(--muted-foreground)] leading-relaxed line-clamp-3">
          {post.description}
        </p>
        <time
          dateTime={post.publishedAt}
          className="text-sm text-[var(--muted-foreground)]"
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
