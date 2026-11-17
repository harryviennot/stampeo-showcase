"use client";

import type { ReactNode } from "react";
import type { LandingCopy } from "@/lib/landing-pages/copy/bundle";
import { ToggleCard, type ToggleTab } from "./ToggleCard";

/** The words of the "run it from your computer or your phone" section. */
export type PlatformWords = LandingCopy["platform"]["PLATFORM"]["platform"];

type Tab = keyof PlatformWords["tabs"];

const TABS: Tab[] = ["dashboard", "scanner"];

/**
 * Platform's toggle card: the dashboard on a computer, or the free Scanner
 * app, each with its title, facts and a link (`pages`) to its feature page.
 */
export function PlatformToggleCard({
  words,
  pages,
  dashboard,
  scanner,
  initial = "dashboard",
}: Readonly<{
  words: PlatformWords;
  pages: Record<Tab, string>;
  dashboard: ReactNode;
  scanner: ReactNode;
  initial?: Tab;
}>) {
  const visuals: Record<Tab, ReactNode> = { dashboard, scanner };
  const tabs: ToggleTab<Tab>[] = TABS.map((key) => {
    const pane = words[key];

    return {
      key,
      label: words.tabs[key],
      title: pane.title,
      facts: pane.facts,
      link: { label: pane.link, href: pages[key] },
      visual: visuals[key],
    };
  });

  return <ToggleCard tabs={tabs} ariaLabel={words.title} initial={initial} />;
}
