/**
 * Next names the share images of default-locale pages under that locale's
 * prefix (`/fr/opengraph-image`, `/fr/blog/<slug>/opengraph-image`) and writes
 * those URLs into og:image. The proxy serves them as is, so crawlers and link
 * unfurlers fetch the image without the as-needed prefix redirect.
 */
export function isDefaultLocaleShareImage(pathname: string, defaultLocale: string): boolean {
  return new RegExp(`^/${defaultLocale}(?:/.*)?/(?:opengraph|twitter)-image(?:/[^/]*)?$`).test(pathname);
}
