import type { ComponentProps } from "react";
import { resolveHelpHref } from "@/lib/help/links";

/**
 * A Markdown link in a help page: help links stay on `/help/...`, other pages
 * of this site go to their English version, other sites open in a new tab.
 */
export function HelpLink({ href, children, ...props }: ComponentProps<"a">) {
  if (href === undefined) return <a {...props}>{children}</a>;

  const resolved = resolveHelpHref(href);
  const external = resolved.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <a {...props} href={resolved.href} {...external}>
      {children}
    </a>
  );
}
