import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
  localePrefix: "as-needed",
  // Next-intl's auto-generated Link header uses the same pathname across
  // locales and doesn't know about our FR↔EN feature-slug mapping, so it
  // emits hreflang pointing to URLs that 308-redirect. Disable it and rely
  // on the correct `<link rel="alternate">` tags from each page's metadata.
  alternateLinks: false,
});
