"use client";

import { useState, type ReactNode } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { Segmented } from "@/components/ui/Segmented";
import { Link } from "@/i18n/navigation";
import { getLocalizedSlug } from "@/lib/feature-slugs";
import { PLATFORM } from "@/lib/landing-pages/copy/platform";
import { FactList } from "../shared/FactList";
import { ARROW_LINK, CELL_TITLE } from "./classes";

type Tab = keyof typeof PLATFORM.platform.tabs;

const TABS: Tab[] = ["dashboard", "scanner"];

/** The feature page each tab's link leads to. */
const FEATURE_PAGE: Record<Tab, string> = {
  dashboard: `/features/${getLocalizedSlug("analytiques", "en")}`,
  scanner: `/features/${getLocalizedSlug("scanner-mobile", "en")}`,
};

/**
 * One white card, two surfaces: the dashboard on a computer, or the free
 * Scanner app. Both panes stay in the page, stacked in one grid cell, so the
 * card never changes height and switching is a cross-fade; the hidden one is
 * out of the tab order and of the reader's way.
 */
export function PlatformToggleCard({
  dashboard,
  scanner,
}: Readonly<{ dashboard: ReactNode; scanner: ReactNode }>) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const visuals: Record<Tab, ReactNode> = { dashboard, scanner };

  return (
    <div>
      <div className="flex justify-center">
        <Segmented
          size="lg"
          ariaLabel={PLATFORM.platform.title}
          className="max-w-[420px]"
          options={TABS.map((key) => ({ value: key, label: PLATFORM.platform.tabs[key] }))}
          value={tab}
          onChange={setTab}
        />
      </div>

      <div className="mt-8 rounded-[32px] bg-white p-6 shadow-[0_2px_4px_rgba(25,18,16,0.04),0_32px_72px_-32px_rgba(25,18,16,0.18)] ring-1 ring-black/5 sm:p-10 lg:p-12">
        <div className="grid">
          {TABS.map((key) => {
            const pane = PLATFORM.platform[key];
            const shown = tab === key;

            return (
              <div
                key={key}
                role="tabpanel"
                aria-label={PLATFORM.platform.tabs[key]}
                inert={!shown}
                className={`col-start-1 row-start-1 grid content-start gap-8 transition-opacity duration-300 motion-reduce:transition-none lg:grid-cols-12 lg:content-normal lg:items-center lg:gap-12 ${
                  shown ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <div className="flex justify-center lg:col-span-7">{visuals[key]}</div>
                <div className="lg:col-span-5">
                  <h3 className={`${CELL_TITLE} text-balance lg:text-[2rem]`}>{pane.title}</h3>
                  <FactList facts={pane.facts} className="mt-6" />
                  <Link href={FEATURE_PAGE[key]} className={`mt-6 ${ARROW_LINK}`}>
                    {pane.link}
                    <ArrowRightIcon size={16} weight="bold" aria-hidden />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
