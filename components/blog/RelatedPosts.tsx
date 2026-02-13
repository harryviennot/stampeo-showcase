import type { BlogPostMeta } from "@/lib/blog/types";
import { BlogCard } from "./BlogCard";

export function RelatedPosts({
  posts,
  title,
}: {
  posts: BlogPostMeta[];
  title: string;
}) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-16 -mx-6 px-6 py-16 bg-[var(--blog-bg-alt)]">
      <h2 className="text-2xl font-extrabold mb-8">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
