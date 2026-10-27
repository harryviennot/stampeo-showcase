import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { HelpTopic } from "@/components/help/HelpTopic";
import { HELP_LOCALES, helpRobots, isHelpLocale } from "@/lib/help/config";
import { getAllHelpPages } from "@/lib/help/index";
import { groupTopics, otherTopics, topicFor } from "@/lib/help/home/topics";

// English only, and only the categories that have a page: any other answers 404.
export const dynamicParams = false;

export function generateStaticParams() {
  const topics = groupTopics(getAllHelpPages());
  return HELP_LOCALES.flatMap((locale) => topics.map((topic) => ({ locale, category: topic.category.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { locale, category } = await params;
  // No canonical and no hreflang: a noindex page names no preferred URL.
  const noindex = { robots: helpRobots() };
  if (!isHelpLocale(locale)) return noindex;

  const topic = topicFor(groupTopics(getAllHelpPages()), category);
  if (!topic) return noindex;

  return { title: topic.category.name, description: topic.category.description, ...noindex };
}

export default async function HelpTopicPage({
  params,
}: Readonly<{
  params: Promise<{ locale: string; category: string }>;
}>) {
  const { locale, category } = await params;
  if (!isHelpLocale(locale)) notFound();

  const topics = groupTopics(getAllHelpPages());
  const topic = topicFor(topics, category);
  if (!topic) notFound();
  setRequestLocale(locale);

  return (
    <HelpTopic topic={topic} others={otherTopics(topics, category)} />
  );
}
