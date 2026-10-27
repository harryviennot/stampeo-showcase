/**
 * The help center at stampeo.app/help: English only, served at locale-free
 * URLs by a proxy rewrite to the `en` locale, and held out of search until
 * `HELP_INDEXABLE` is flipped.
 *
 * No `fs` and no `@/` imports: `next.config.ts` and the proxy both load this.
 */

/**
 * May search engines index the help center? The ONE switch: the robots meta
 * (`helpRobots`) and the `X-Robots-Tag` header (`helpHeaders`) both read it.
 * The sitemap, llms.txt and IndexNow gain the help URLs separately, at launch.
 */
export const HELP_INDEXABLE = false;

/** The languages the help center is written in. */
export const HELP_LOCALES = ["en"] as const;

export type HelpLocale = (typeof HELP_LOCALES)[number];

export function isHelpLocale(value: unknown): value is HelpLocale {
  return (HELP_LOCALES as readonly unknown[]).includes(value);
}

/**
 * The `robots` directive for any help page. `follow` stays true when noindex,
 * so going live does not start from zero discovery.
 */
export function helpRobots(): { index: boolean; follow: boolean } {
  return { index: HELP_INDEXABLE, follow: true };
}

/**
 * Is this URL inside the help center?
 *
 * Matches `/help` or `/help/…` and nothing longer, so a shop slugged
 * `helpful-cafe` is not mistaken for it. Takes the BROWSER path: a
 * locale-prefixed copy (`/en/help`) is not the real URL, it redirects to it.
 */
export function isHelpPath(pathname: string): boolean {
  return pathname === "/help" || pathname.startsWith("/help/");
}

/**
 * The `headers()` rules that keep the help center out of search as a response
 * header too, for the copies of a page (error pages, non-HTML responses) that
 * carry no robots meta. Empty once the center is indexable.
 */
export function helpHeaders(indexable: boolean = HELP_INDEXABLE) {
  if (indexable) return [];
  return [
    {
      source: "/help/:path*",
      headers: [{ key: "X-Robots-Tag", value: "noindex" }],
    },
  ];
}
