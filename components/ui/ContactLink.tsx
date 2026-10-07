"use client";

import type { ComponentProps } from "react";
import { usePathname } from "next/navigation";
import { isTrackablePath } from "@/lib/consent-routes";
import { trackThen } from "@/lib/cta/events";
import { metaEventForLink, trackMetaEvent } from "@/lib/meta-pixel";

type ContactLinkProps = ComponentProps<"a"> & { href: string };

/**
 * A plain `<a>` to a `mailto:`, `tel:` or WhatsApp link that reports its click
 * to Meta as a Contact: it leaves the page without a request of ours, so the
 * click is the only moment it can be seen. Renders exactly the `<a>` it
 * replaces; the caller's own `onClick` still runs.
 *
 * The pixel sends only when it loaded (which needs consent) and the current
 * page is trackable, as for every other event.
 */
export function ContactLink({ href, onClick, ...props }: ContactLinkProps) {
  const pathname = usePathname();

  return (
    <a
      {...props}
      href={href}
      onClick={trackThen(() => {
        const event = metaEventForLink(href);
        if (event) trackMetaEvent({ event, trackable: isTrackablePath(pathname) });
      }, onClick)}
    />
  );
}
