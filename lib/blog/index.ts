import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { BlogPost, BlogPostMeta } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content/blog");

export function getPostBySlug(
  slug: string,
  locale: string
): BlogPost | null {
  const filePath = path.join(CONTENT_DIR, locale, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) return null;

  const source = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(source);
  const stats = readingTime(content);

  return {
    title: data.title,
    description: data.description,
    publishedAt: data.publishedAt,
    updatedAt: data.updatedAt,
    author: data.author,
    coverImage: data.coverImage,
    tags: data.tags || [],
    category: data.category || "General",
    translationSlug: data.translationSlug,
    featured: data.featured || false,
    slug,
    locale,
    readingTime: stats.text,
    content,
  };
}

export function getAllPosts(locale: string): BlogPostMeta[] {
  const dir = path.join(CONTENT_DIR, locale);

  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));

  const posts = files.map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    const source = fs.readFileSync(path.join(dir, file), "utf-8");
    const { data, content } = matter(source);
    const stats = readingTime(content);

    return {
      title: data.title,
      description: data.description,
      publishedAt: data.publishedAt,
      updatedAt: data.updatedAt,
      author: data.author,
      coverImage: data.coverImage,
      tags: data.tags || [],
      category: data.category || "General",
      translationSlug: data.translationSlug,
      featured: data.featured || false,
      slug,
      locale,
      readingTime: stats.text,
    } satisfies BlogPostMeta;
  });

  return posts.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getAllSlugs(locale: string): string[] {
  const dir = path.join(CONTENT_DIR, locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getRelatedPosts(
  currentSlug: string,
  locale: string,
  limit = 3
): BlogPostMeta[] {
  const current = getPostBySlug(currentSlug, locale);
  if (!current) return [];

  const all = getAllPosts(locale).filter((p) => p.slug !== currentSlug);

  const scored = all.map((post) => {
    let score = 0;
    for (const tag of post.tags) {
      if (current.tags.includes(tag)) score += 2;
    }
    if (post.category === current.category) score += 1;
    return { post, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.post);
}

export function getAllTags(locale: string): string[] {
  const posts = getAllPosts(locale);
  const tags = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags) {
      tags.add(tag);
    }
  }
  return Array.from(tags).sort();
}
