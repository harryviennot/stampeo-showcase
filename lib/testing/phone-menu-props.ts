import { createTranslator } from "next-intl";
import type { PhoneMenuProps } from "@/components/sections/HeaderBar";
import type { FeatureLinks } from "@/lib/landing-pages/preview-nav";
import type { Market } from "@/lib/markets";
import { loadCatalog } from "./catalogs";
import { pageMenuItems } from "../nav/menu-items";

/** The props a header hands its phone menu on a page at `pathname`, built as the header builds them. */
export function phoneMenuProps(
  market: Market,
  featureLinks: FeatureLinks,
  pathname: string,
  overrides: Partial<Omit<PhoneMenuProps, "children">> = {},
): Omit<PhoneMenuProps, "children"> {
  const t = createTranslator({ locale: "en", messages: loadCatalog("en") }) as (key: string) => string;

  return {
    open: true,
    onToggle: () => {},
    onClose: () => {},
    scrolled: false,
    featureLinks,
    market,
    pathname,
    ...pageMenuItems(t, "en", market),
    signedIn: false,
    appUrl: "https://app.stampeo.app",
    onSignOut: () => {},
    ...overrides,
  };
}

