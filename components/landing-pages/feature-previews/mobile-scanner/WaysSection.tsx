import { DevicePhoneMobileIcon, GlobeIcon } from "@/components/icons";
import { MOBILE_SCANNER_PREVIEW } from "@/lib/landing-pages/copy/previews/mobile-scanner";
import { CELL_TITLE } from "../../platform/classes";
import { Chip } from "../../shared/Chip";
import { IconTile } from "../../shared/IconTile";
import { LpSection } from "../../shared/LpSection";
import { AppStoreLinks } from "./AppStoreLinks";

/** The app and the browser, each led by an icon tile. */
const ICONS = [DevicePhoneMobileIcon, GlobeIcon];

const CARD =
  "flex flex-col rounded-[28px] bg-white p-6 shadow-[0_2px_4px_rgba(25,18,16,0.04),0_32px_72px_-32px_rgba(25,18,16,0.18)] ring-1 ring-black/5 lg:p-9";

/** The app and the browser as two white cards, the devices each runs on, the store badges in the app's card, and the line that says both do the same job. */
export function WaysSection() {
  const { eyebrow, title, lead, cells, fact } = MOBILE_SCANNER_PREVIEW.ways;

  return (
    <LpSection section="ways" eyebrow={eyebrow} title={title} lead={lead} align="center">
      <ul className="mx-auto grid max-w-[1040px] gap-4 lg:grid-cols-2 lg:gap-6">
        {cells.map((cell, index) => {
          const Icon = ICONS[index];

          return (
            <li key={cell.title} className={CARD}>
              <IconTile tone="subtle">
                <Icon size={22} weight="duotone" aria-hidden />
              </IconTile>
              <h3 className={`mt-5 ${CELL_TITLE}`}>{cell.title}</h3>
              <p className="mt-3 text-base text-pretty text-[var(--muted-foreground)]">{cell.body}</p>
              <p className="mt-5 flex flex-wrap gap-2">
                {cell.devices.map((device) => (
                  <Chip key={device}>{device}</Chip>
                ))}
              </p>
              {index === 0 && (
                <div className="mt-auto pt-6">
                  <AppStoreLinks />
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mx-auto mt-8 max-w-xl text-center text-base text-pretty text-[var(--muted-foreground)]">{fact}</p>
    </LpSection>
  );
}
