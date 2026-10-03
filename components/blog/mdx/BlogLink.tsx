import type { ComponentProps } from "react";
import { TrackedAnchor } from "@/components/ui/TrackedAnchor";
import { blogLinkLocation } from "@/lib/cta/taxonomy";

/**
 * A markdown link in a blog post. A link to the signup or contact page reports
 * its click; every other link renders exactly as written.
 */
export function BlogLink({ href, ...props }: ComponentProps<"a">) {
  const trackAs = href === undefined ? null : blogLinkLocation(href);
  if (href === undefined || trackAs === null) return <a {...props} href={href} />;
  return <TrackedAnchor {...props} href={href} trackAs={trackAs} />;
}
