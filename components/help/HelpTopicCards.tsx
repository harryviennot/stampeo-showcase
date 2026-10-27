import { useTranslations } from "next-intl";
import { ArrowRightIcon } from "@/components/icons";
import { HOME_TOPIC_LINKS, type Topic } from "@/lib/help/home/topics";
import { HelpPageList } from "./HelpPageList";

/**
 * "Browse by topic" on the help home. A list of topic rows on a phone, and
 * three columns of cards on a desktop, each with its first few pages and a
 * "See all" link.
 */
export function HelpTopicCards({ topics }: { topics: readonly Topic[] }) {
  const t = useTranslations("help.home");

  if (topics.length === 0) return null;

  return (
    <section aria-labelledby="help-topics">
      <h2 id="help-topics" className="text-h3 mb-3 text-[var(--near-black)] md:mb-4">
        {t("browseByTopic")}
      </h2>

      <HelpPageList
        className="md:hidden"
        items={topics.map((topic) => ({
          href: `/help/topics/${topic.category.slug}`,
          title: topic.category.name,
          description: topic.category.description,
        }))}
      />

      <ul className="hidden gap-6 md:grid md:grid-cols-3">
        {topics.map((topic) => (
          <li key={topic.category.slug} className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--paper)] p-6">
            <h3 className="text-h3 text-[var(--near-black)]">
              <a href={`/help/topics/${topic.category.slug}`}>{topic.category.name}</a>
            </h3>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">{topic.category.description}</p>
            <ul className="mt-3 flex-1">
              {topic.pages.slice(0, HOME_TOPIC_LINKS).map((page) => (
                <li key={page.slug}>
                  <a
                    href={`/help/${page.slug}`}
                    className="flex min-h-11 items-center text-[var(--near-black)] underline-offset-4 hover:underline"
                  >
                    {page.title}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href={`/help/topics/${topic.category.slug}`}
              className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-[var(--near-black)] hover:underline underline-offset-4"
            >
              {t("seeAll", { count: topic.pages.length })}
              <ArrowRightIcon aria-hidden className="h-4 w-4" weight="bold" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
