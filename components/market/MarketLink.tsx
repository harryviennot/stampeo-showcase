import NextLink from "next/link";
import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";
import type { Market } from "@/lib/markets";

/**
 * A link whose `href` is already the complete path for its market. A pilot
 * path (`/us/pricing`) is final as written, so it goes through next/link;
 * next-intl's Link would prefix it to `/en/us/pricing`.
 */
export function MarketLink({
  market,
  ...props
}: Readonly<{ market: Market } & ComponentProps<typeof Link>>) {
  const Component = market === "int" ? Link : NextLink;
  return <Component {...props} />;
}
