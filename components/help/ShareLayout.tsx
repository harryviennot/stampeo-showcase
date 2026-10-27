import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { StampeoLogo } from "@/components/logo";
import { Container } from "@/components/ui/Container";
import type { HelpPage } from "@/lib/help/types";
import { HelpFooter } from "./HelpFooter";
import { ShareButton } from "./ShareButton";

/**
 * A page an owner sends to someone else: a slim bar with the logo (not a
 * link, the reader is a shop's customer) and Share, the steps, one line
 * pointing them back to the shop, and the slim footer. No site header, no full
 * footer, no way out; the bar and footer are left off when printed.
 */
export function ShareLayout({ page, children }: { page: HelpPage; children: ReactNode }) {
  const t = useTranslations("help.share");
  const tBrand = useTranslations("common.footer");

  return (
    <div className="flex min-h-screen flex-col bg-[var(--blog-bg)] print:bg-white">
      <div className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--blog-bg)]/95 backdrop-blur print:hidden">
        <Container>
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[var(--accent)]">
                <StampeoLogo />
              </span>
              <span className="text-lg font-bold tracking-tight text-[var(--near-black)]">{tBrand("brand")}</span>
            </div>
            <ShareButton title={page.title} />
          </div>
        </Container>
      </div>

      <main className="flex-1 pb-12 pt-8">
        <Container size="narrow">
          <h1 className="text-h1 text-[var(--near-black)]">{page.title}</h1>
          <article className="help-prose help-share prose blog-prose mt-6 max-w-none leading-[1.6] lg:prose-lg">
            {children}
          </article>
          <p className="mt-10 text-[var(--muted-foreground)]">{t("askAtTheShop")}</p>
        </Container>
      </main>

      <HelpFooter compact />
    </div>
  );
}
