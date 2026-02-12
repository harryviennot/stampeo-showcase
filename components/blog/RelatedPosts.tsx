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
    <section className="mt-16">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}
