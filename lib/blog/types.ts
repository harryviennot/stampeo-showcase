export interface BlogPostMeta {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  coverImage?: string;
  tags: string[];
  faqs?: Array<{ question: string; answer: string }>;
  category: string;
  featured?: boolean;
  slug: string;
  locale: string;
  /** Whole minutes to read, as reading-time rounds them. */
  readingMinutes: number;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}
