import { useTranslations } from "next-intl";
import { CookiePreferencesButton } from "@/components/consent/CookiePreferencesButton";
import { StampeoLogo } from "@/components/logo";
import { Container } from "@/components/ui/Container";
import { resolveHelpHref } from "@/lib/help/links";

const TEXT = "text-sm text-[var(--muted-foreground)] transition-colors hover:text-[var(--near-black)]";
/** A link in a row of its own: 44px tall. */
const NAV_LINK = `inline-flex min-h-11 items-center ${TEXT}`;
/** A link beside the cookie button: 44px through padding, offset by an equal negative margin. */
const LEGAL_LINK = `-my-3 py-3 ${TEXT}`;

/** A link to the English version of a page of the main site. */
const site = (path: string) => resolveHelpHref(path).href;

/**
 * The slim footer under every help page, in place of the site's full one: the
 * privacy link and the cookie-preferences control (required wherever a cookie
 * can be set), and, unless `compact`, a few ways back into the site so the
 * help center is not a dead end. `compact` is for pages sent to a shop's
 * customers, where nothing should lead away.
 */
export function HelpFooter({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("help.footer");
  const tSite = useTranslations("common.footer");

  return (
    <footer className="help-footer border-t border-[var(--border)] py-6 print:hidden">
      <Container>
        {!compact && (
          <div className="mb-3 flex flex-col items-center gap-1 sm:flex-row sm:justify-between">
            <a href={site("/")} className="flex min-h-11 items-center gap-2" aria-label={tSite("brand")}>
              <span className="text-[var(--accent)]">
                <StampeoLogo />
              </span>
              <span className="text-lg font-bold tracking-tight text-[var(--near-black)]">{tSite("brand")}</span>
            </a>
            <nav aria-label={t("navLabel")} className="flex flex-wrap justify-center gap-x-6">
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/help" className={NAV_LINK}>
                {t("helpCenter")}
              </a>
              <a href={site("/pricing")} className={NAV_LINK}>
                {tSite("pricing")}
              </a>
              <a href={`${site("/")}#features`} className={NAV_LINK}>
                {tSite("features")}
              </a>
              <a href={site("/contact")} className={NAV_LINK}>
                {tSite("contact")}
              </a>
            </nav>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-center gap-x-6 text-sm">
          <a href={site("/privacy")} className={LEGAL_LINK}>
            {tSite("privacyPolicy")}
          </a>
          {!compact && (
            <a href={site("/terms")} className={LEGAL_LINK}>
              {tSite("termsOfService")}
            </a>
          )}
          <CookiePreferencesButton tone="page" />
        </div>
        {!compact && (
          <p className="mt-5 text-center text-xs text-[var(--muted-foreground)]">
            {tSite("allRightsReserved", { year: new Date().getFullYear() })}
          </p>
        )}
      </Container>
    </footer>
  );
}
