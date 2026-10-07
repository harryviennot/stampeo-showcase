import type { ComponentProps } from "react";
import { ContactLink } from "@/components/ui/ContactLink";
import { TrackedAnchor } from "@/components/ui/TrackedAnchor";
import { blogLinkLocation, isDirectContactHref } from "@/lib/cta/taxonomy";

/**
 * A markdown link in a blog post. A link to the signup or contact page, or to
 * an email, phone or WhatsApp app, reports its click; every other link renders
 * exactly as written.
 */
export function BlogLink({ href, ...props }: ComponentProps<"a">) {
  if (href !== undefined && isDirectContactHref(href)) {
    return <ContactLink {...props} href={href} />;
  }
  const trackAs = href === undefined ? null : blogLinkLocation(href);
  if (href === undefined || trackAs === null) return <a {...props} href={href} />;
  return <TrackedAnchor {...props} href={href} trackAs={trackAs} />;
}
