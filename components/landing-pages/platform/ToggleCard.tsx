"use client";

import { useState, type ReactNode } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { Segmented } from "@/components/ui/Segmented";
import { Link } from "@/i18n/navigation";
import type { TabCopy } from "@/lib/landing-pages/copy/types";
import { FactList } from "../shared/FactList";
import { ARROW_LINK, CELL_TITLE } from "./classes";

/** One surface of the card: its tab, its title and facts, an optional link and its picture. */
export interface ToggleTab<Key extends string> extends TabCopy {
  key: Key;
  link?: { label: string; href: string };
  visual: ReactNode;
}

const SURFACE = "card-stamp rounded-[24px] bg-white p-6 sm:rounded-[28px] sm:p-10 lg:p-12";

/** A pane is a grid: one column on a phone, its picture 7 columns and its words 5 from `lg`. */
const GRID = "grid content-start gap-8";
const GRID_LG = "lg:grid-cols-12 lg:content-normal lg:items-center lg:gap-12";

function Words<Key extends string>({ tab }: Readonly<{ tab: ToggleTab<Key> }>) {
  return (
    <div className="lg:col-span-5">
      <h3 className={`${CELL_TITLE} text-balance lg:text-[2rem]`}>{tab.title}</h3>
      <FactList facts={tab.facts} className="mt-6" />
      {tab.link && (
        <Link href={tab.link.href} className={`mt-6 ${ARROW_LINK}`}>
          {tab.link.label}
          <ArrowRightIcon size={16} weight="bold" aria-hidden />
        </Link>
      )}
    </div>
  );
}

/**
 * One white card in the house ink frame, a surface per tab. All panes stay in the page, stacked in
 * one grid cell, so the card never changes height and switching is a
 * cross-fade; the hidden one is out of the tab order and of the reader's way.
 * With one tab it is the white surface alone: no tabs, nothing hidden.
 */
export function ToggleCard<Key extends string>({
  tabs,
  ariaLabel,
  initial,
}: Readonly<{ tabs: ReadonlyArray<ToggleTab<Key>>; ariaLabel: string; initial?: Key }>) {
  const [tab, setTab] = useState<Key | undefined>(initial ?? tabs[0]?.key);

  if (tabs.length === 1) {
    const only = tabs[0];

    return (
      <div className={SURFACE}>
        <div className={`${GRID} ${GRID_LG}`}>
          <div className="flex justify-center lg:col-span-7">{only.visual}</div>
          <Words tab={only} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-center">
        <Segmented
          size="lg"
          ariaLabel={ariaLabel}
          className="max-w-[420px]"
          options={tabs.map(({ key, label }) => ({ value: key, label }))}
          value={tab ?? tabs[0].key}
          onChange={setTab}
        />
      </div>

      <div className={`mt-8 ${SURFACE}`}>
        <div className="grid">
          {tabs.map((pane) => {
            const shown = tab === pane.key;

            return (
              <div
                key={pane.key}
                role="tabpanel"
                aria-label={pane.label}
                inert={!shown}
                className={`col-start-1 row-start-1 ${GRID} transition-opacity duration-300 motion-reduce:transition-none ${GRID_LG} ${
                  shown ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <div className="flex justify-center lg:col-span-7">{pane.visual}</div>
                <Words tab={pane} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
