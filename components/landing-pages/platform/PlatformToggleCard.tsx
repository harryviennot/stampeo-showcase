"use client";

import type { ReactNode } from "react";
import { getLocalizedSlug } from "@/lib/feature-slugs";
import { PLATFORM } from "@/lib/landing-pages/copy/platform";
import { ToggleCard, type ToggleTab } from "./ToggleCard";

type Tab = keyof typeof PLATFORM.platform.tabs;

const TABS: Tab[] = ["dashboard", "scanner"];

/** The feature page each tab's link leads to. */
const FEATURE_PAGE: Record<Tab, string> = {
  dashboard: `/features/${getLocalizedSlug("analytiques", "en")}`,
  scanner: `/features/${getLocalizedSlug("scanner-mobile", "en")}`,
};

/**
 * Platform's toggle card: the dashboard on a computer, or the free Scanner
 * app, each with its title, facts and a link to its feature page.
 */
export function PlatformToggleCard({
  dashboard,
  scanner,
  initial = "dashboard",
}: Readonly<{ dashboard: ReactNode; scanner: ReactNode; initial?: Tab }>) {
  const visuals: Record<Tab, ReactNode> = { dashboard, scanner };
  const tabs: ToggleTab<Tab>[] = TABS.map((key) => {
    const pane = PLATFORM.platform[key];

    return {
      key,
      label: PLATFORM.platform.tabs[key],
      title: pane.title,
      facts: pane.facts,
      link: { label: pane.link, href: FEATURE_PAGE[key] },
      visual: visuals[key],
    };
  });

  return <ToggleCard tabs={tabs} ariaLabel={PLATFORM.platform.title} initial={initial} />;
}
