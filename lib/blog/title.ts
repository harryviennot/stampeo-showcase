/**
 * The `title` metadata of a blog post.
 *
 * The root layout's `title.template` appends " | Stampeo" to every page title.
 * Search results show about 60 characters, so a post title that would pass 60
 * with the brand is shown on its own, keyword first, instead of being cut.
 */

export const BRAND_SUFFIX = " | Stampeo";
const TITLE_BUDGET = 60;

export type PostTitle = string | { absolute: string };

export function postTitle(title: string): PostTitle {
  return title.length + BRAND_SUFFIX.length > TITLE_BUDGET ? { absolute: title } : title;
}
