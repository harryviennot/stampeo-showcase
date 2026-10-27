import { useTranslations } from "next-intl";
import { CaretLeftIcon } from "@/components/icons";
import type { Topic } from "@/lib/help/home/topics";
import { HelpGrid } from "./HelpGrid";
import { HelpPageList } from "./HelpPageList";
import { HelpPageShell } from "./HelpPageShell";
import { HelpSearchPill } from "./search/HelpSearchTrigger";
import { StillStuck } from "./StillStuck";

const ROW =
  "flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-[var(--near-black)] hover:bg-[var(--paper-hover)]";

/**
 * A topic page: back to the help home with the Search pill, the topic's name
 * and one line, and every page in it as a row. The other topics are chips
 * under the list on a phone and a sticky list in the rail on a desktop.
 */
export function HelpTopic({ topic, others }: { topic: Topic; others: readonly Topic[] }) {
  const t = useTranslations("help.topics");

  return (
    <HelpPageShell>
      <HelpGrid
        top={
          <div className="flex items-center justify-between gap-3">
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/help" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-[var(--near-black)]">
              <CaretLeftIcon aria-hidden className="h-4 w-4" />
              {t("back")}
            </a>
            <HelpSearchPill />
          </div>
        }
        rail={
          others.length > 0 && (
            <nav aria-labelledby="help-other-topics" className="sticky top-28">
              <h2 id="help-other-topics" className="mb-2 px-3 text-sm font-bold text-[var(--near-black)]">
                {t("otherTopics")}
              </h2>
              <ul>
                {others.map((other) => (
                  <li key={other.category.slug}>
                    <a href={`/help/topics/${other.category.slug}`} className={ROW}>
                      {other.category.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )
        }
      >
        <h1 className="text-h1 mt-4 text-[var(--near-black)]">{topic.category.name}</h1>
        <p className="text-lead mt-3 text-[var(--muted-foreground)]">{topic.category.description}</p>

        <HelpPageList
          className="mt-6"
          items={topic.pages.map((page) => ({
            href: `/help/${page.slug}`,
            title: page.title,
            description: page.description,
          }))}
        />

        {others.length > 0 && (
          <nav aria-labelledby="help-other-topics-chips" className="mt-10 lg:hidden">
            <h2 id="help-other-topics-chips" className="text-h3 text-[var(--near-black)]">
              {t("otherTopics")}
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {others.map((other) => (
                <li key={other.category.slug}>
                  <a
                    href={`/help/topics/${other.category.slug}`}
                    className="inline-flex h-11 items-center rounded-full border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--near-black)]"
                  >
                    {other.category.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <StillStuck className="mt-10" />
      </HelpGrid>
    </HelpPageShell>
  );
}
