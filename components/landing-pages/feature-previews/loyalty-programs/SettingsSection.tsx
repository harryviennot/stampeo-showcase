import { ArrowsClockwiseIcon, Gift, TargetIcon, WalletIcon } from "@/components/icons";
import { LOYALTY_PROGRAMS_PREVIEW } from "@/lib/landing-pages/copy/previews/loyalty-programs";
import { CARD_SHADOW, CARD_TITLE } from "../../platform/classes";
import { IconTile } from "../../shared/IconTile";
import { LpSection } from "../../shared/LpSection";
import { SettingFigure } from "./SettingFigure";

/** The glyph on each setting's tile, in the order of the copy. */
const ICONS = [Gift, WalletIcon, TargetIcon, ArrowsClockwiseIcon];

const CARD = `flex flex-col rounded-[28px] bg-white p-6 ${CARD_SHADOW} ring-1 ring-black/5 lg:p-8`;

/** Four settings on white cards, each with what it does and our tip, and the study that backs the welcome gift under them. */
export function SettingsSection() {
  const { eyebrow, title, lead, items, tipLabel, figure } = LOYALTY_PROGRAMS_PREVIEW.settings;

  return (
    <LpSection section="settings" eyebrow={eyebrow} title={title} lead={lead} align="center">
      <div className="mx-auto max-w-[480px] text-left sm:max-w-[1040px]">
        <ul className="grid gap-5 sm:grid-cols-2 lg:gap-6">
          {items.map((item, index) => {
            const Icon = ICONS[index];

            return (
              <li key={item.title} className={CARD}>
                <IconTile tone="brand">
                  <Icon size={22} weight="bold" aria-hidden />
                </IconTile>
                <h3 className={`${CARD_TITLE} mt-5 lg:text-[1.375rem]`}>{item.title}</h3>
                <p className="mt-2 text-[15px] text-pretty text-[var(--muted-foreground)] lg:text-base">{item.body}</p>
                <div className="mt-auto pt-5">
                  <p className="rounded-2xl bg-[var(--background-subtle)] px-4 py-3 text-[15px] text-pretty text-[var(--foreground)]">
                    <strong className="font-bold text-[var(--accent-hover)]">{tipLabel}</strong> {item.tip}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
        <SettingFigure figure={figure} />
      </div>
    </LpSection>
  );
}
