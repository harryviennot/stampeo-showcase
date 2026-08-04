import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Container } from "../ui/Container";
import { getPlatformVersion } from "@/lib/changelog";

/**
 * A quiet line near the foot of the page showing the product ships. Reads as
 * a fact, not a promotion, so it stays out of the accent budget.
 */
export async function VariantChangelogTeaser() {
  const t = await getTranslations("variant.changelog");
  const { platform } = await getPlatformVersion();

  // No version means the changelog API gave us nothing, so there is nothing to
  // send anyone to. Better to show no link than a link to an empty page.
  if (!platform) return null;

  return (
    <section className="pb-8">
      <Container>
        <Link
          href="/changelog"
          className="group flex items-center justify-between gap-4 rounded-xl card-stamp bg-white px-5 py-4"
        >
          <span className="flex items-center gap-3 min-w-0">
            <span className="shrink-0 rounded-full bg-[var(--accent)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--accent)] tabular-nums">
              v{platform}
            </span>
            <span className="text-sm text-[var(--foreground)] truncate">
              {t("whatsNew")}
            </span>
          </span>
          <ArrowRight
            className="w-4 h-4 shrink-0 text-[var(--muted-foreground)] transition-transform group-hover:translate-x-0.5"
            weight="bold"
          />
        </Link>
      </Container>
    </section>
  );
}
