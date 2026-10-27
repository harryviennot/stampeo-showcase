import { localePath } from "@/lib/hreflang";
import { isHelpPath } from "./config";

export interface ResolvedHref {
  href: string;
  /** True for another site: it opens in a new tab. */
  newTab: boolean;
}

/**
 * Where a link written in a help page should point.
 *
 * Help links stay on the locale-free `/help/...` URL (a localized Link would
 * render `/en/help` and cost a redirect). Other pages of this site go to their
 * English version. Other sites open in a new tab. Anchors, mail and phone links
 * are left as written.
 */
export function resolveHelpHref(href: string): ResolvedHref {
  const plain = { href, newTab: false };

  if (href.startsWith("#") || /^(?:mailto|tel):/i.test(href)) return plain;
  if (/^(?:https?:)?\/\//i.test(href)) return { href, newTab: true };
  if (!href.startsWith("/")) return plain;
  if (isHelpPath(href.split(/[?#]/)[0])) return plain;

  return { href: localePath("en", href), newTab: false };
}

const PRODUCTION_DASHBOARD = "https://app.stampeo.app";

/** A dashboard screen's address: the app url plus its path. */
export function dashboardUrl(path: string, appUrl: string | undefined = process.env.NEXT_PUBLIC_APP_URL): string {
  const base = (appUrl || PRODUCTION_DASHBOARD).replace(/\/+$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
