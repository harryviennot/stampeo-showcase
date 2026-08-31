/**
 * Locales the blog is published in.
 *
 * Not every site locale has articles: Spanish shipped with 4 of French's 16,
 * and Polish launched with none (STA-250). A locale that isn't listed here has
 * no blog route, no blog link in the nav and no blog entry in the sitemap.
 *
 * Kept in its own module (no `fs`) so client components can import it too.
 */
export const BLOG_LOCALES = ["fr", "en", "es"] as const;

export function hasBlog(locale: string): boolean {
  return (BLOG_LOCALES as readonly string[]).includes(locale);
}
