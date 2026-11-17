"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FEATURE_ITEMS } from "@/lib/features";
import { FEATURE_PREVIEWS, featureLink, isComingSoon } from "@/lib/landing-pages/preview-nav";
import { navClick } from "@/lib/posthog/site-events";
import { isCurrentPath } from "@/lib/nav/mobile-menu";
import { ChevronDownIcon } from "../icons";
import { MarketLink } from "../market/MarketLink";
import { LanguageSwitcher } from "../ui/LanguageSwitcher";
import { TrackedLink } from "../ui/TrackedLink";
import { HeaderBar, type PhoneMenuProps } from "./HeaderBar";
import { SoonPill } from "./SoonPill";

/** The six features under the Product row, each linked to its page, geolocation marked "Soon". */
export function AccordionFeatureRows({ onNavigate }: { onNavigate: () => void }) {
  const t = useTranslations("common.nav");
  const locale = useLocale();

  return (
    <div className="pl-4 pb-2 space-y-0.5">
      {FEATURE_ITEMS.map(({ key, canonicalSlug, Icon }) => {
        const { href, market } = featureLink(canonicalSlug, locale);

        return (
          <MarketLink
            key={canonicalSlug}
            market={market}
            href={href as "/features/design-de-carte"}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-[var(--accent)]/5 transition-colors"
            onClick={navClick(FEATURE_PREVIEWS[canonicalSlug], "mobile", onNavigate)}
          >
            <Icon className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-sm font-medium text-[var(--foreground)]">{t(`featuresItems.${key}.label`)}</span>
            {isComingSoon(canonicalSlug) && <SoonPill />}
          </MarketLink>
        );
      })}
    </div>
  );
}

/** The Product row of the menu: it opens a list of the features under it. */
function MobileFeaturesAccordion({ onNavigate }: { onNavigate: () => void }) {
  const t = useTranslations("common.nav");
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-[var(--foreground)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5 rounded-xl transition-colors"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {t("product")}
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <AccordionFeatureRows onNavigate={onNavigate} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** The phone menu's button: a burger that turns to an X. */
function AccordionBurger({ open, onToggle }: Readonly<{ open: boolean; onToggle: () => void }>) {
  return (
    <button
      className="lg:hidden p-2 text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
      onClick={onToggle}
      aria-expanded={open}
      aria-label={open ? "Close menu" : "Open menu"}
    >
      {open ? (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      )}
    </button>
  );
}

/** The open panel under the bar: Product as an accordion, then every other link as a row, the language and the sign-in buttons. */
export function AccordionPanel({
  onClose,
  pathname,
  navItems,
  resourceItems,
  signedIn,
  appUrl,
  onSignOut,
}: Readonly<Omit<PhoneMenuProps, "open" | "onToggle" | "scrolled" | "children">>) {
  const t = useTranslations();
  const row = (href: string) =>
    `px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${isCurrentPath(pathname, href)
      ? "text-[var(--accent)] bg-[var(--accent)]/5"
      : "text-[var(--foreground)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/5"
      }`;

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="lg:hidden overflow-hidden border-t border-[var(--accent)]/10 bg-[var(--cream)]"
    >
      <div className="px-6 py-4">
        <div className="flex flex-col gap-1">
          <MobileFeaturesAccordion onNavigate={onClose} />
          {navItems.map((item) => (
            <MarketLink key={item.href} market={item.market ?? "int"} href={item.href} className={row(item.href)} onClick={navClick(item.preview, "mobile", onClose)}>
              {item.label}
            </MarketLink>
          ))}
          {/* Resources are a dropdown on desktop; on a phone they
              read better as plain rows than as a second accordion. */}
          {resourceItems.map((item) => (
            <Link key={item.href} href={item.href as "/blog"} className={row(item.href)} onClick={onClose}>
              {item.label}
            </Link>
          ))}
          <div className="flex items-center justify-between pt-4 mt-2 border-t border-[var(--accent)]/10">
            <LanguageSwitcher />
          </div>
          <div className="flex flex-col gap-2">
            {signedIn ? (
              <>
                <button
                  onClick={onSignOut}
                  className="px-4 py-3 text-sm text-left font-semibold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
                >
                  {t("common.auth.signOut")}
                </button>
                <Link
                  href={appUrl}
                  className="flex items-center justify-center h-12 px-5 bg-[var(--accent)] text-white text-sm font-bold rounded-xl hover:brightness-110 transition-all"
                >
                  {t("common.auth.dashboard")}
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-3 text-sm font-semibold text-[var(--foreground)] hover:text-[var(--accent)] transition-colors"
                  onClick={onClose}
                >
                  {t("common.auth.logIn")}
                </Link>
                <TrackedLink
                  trackAs="header_mobile"
                  href="/onboarding"
                  className="flex items-center justify-center h-12 px-5 bg-[var(--accent)] text-white text-sm font-bold rounded-xl hover:brightness-110 transition-all"
                  onClick={onClose}
                >
                  {t("common.auth.getStarted")}
                </TrackedLink>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/** The header bar with today's phone menu: a burger that opens an accordion panel under the bar. */
export function AccordionMenu({ open, onToggle, scrolled, children, ...panel }: Readonly<PhoneMenuProps>) {
  return (
    <HeaderBar scrolled={scrolled} burger={<AccordionBurger open={open} onToggle={onToggle} />} below={<AnimatePresence>{open && <AccordionPanel {...panel} />}</AnimatePresence>}>
      {children}
    </HeaderBar>
  );
}
