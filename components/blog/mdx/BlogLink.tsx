import type { ComponentProps } from "react";
import { ContactLink } from "@/components/ui/ContactLink";
import { TrackedAnchor } from "@/components/ui/TrackedAnchor";
import type { CTALocation } from "@/lib/analytics";
import { blogLinkLocation, isDirectContactHref } from "@/lib/cta/taxonomy";

/**
 * A markdown link in a blog post. A link to the signup or contact page, or to
 * an email, phone or WhatsApp app, reports its click; every other link renders
 * exactly as written.
 */
export function BlogLink({
  href,
  trackAs: signupAs = "blog_link",
  ...props
}: ComponentProps<"a"> & {
  /** Where a link to the signup page is reported from, for pages that reuse this link. */
  trackAs?: Extract<CTALocation, "blog_link" | "comparison_link">;
}) {
  if (href !== undefined && isDirectContactHref(href)) {
    return <ContactLink {...props} href={href} />;
  }
  const found = href === undefined ? null : blogLinkLocation(href);
  if (href === undefined || found === null) return <a {...props} href={href} />;
  return <TrackedAnchor {...props} href={href} trackAs={found === "blog_link" ? signupAs : found} />;
}
