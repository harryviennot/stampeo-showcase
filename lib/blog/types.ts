export interface BlogPostMeta {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  coverImage?: string;
  tags: string[];
  category: string;
  translationSlug?: string;
  featured?: boolean;
  slug: string;
  locale: string;
  readingTime: string;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}
