/* eslint-disable @next/next/no-img-element */
import { STAMP_SAMPLES } from "@/lib/loyalty-samples";
import { PUSH_NOTIFICATIONS_PREVIEW as COPY } from "@/lib/landing-pages/copy/previews/push-notifications";

/** The shops whose notification icons it shows: the sample café, the car wash and the juice bar. */
const SHOPS = ["aurevo", "lustre", "pulp"].flatMap((id) => STAMP_SAMPLES.filter((sample) => sample.id === id));

/** Each tile is the shop's own stamp icon on its card colour. */
const TILES = SHOPS.map((shop) => ({
  id: shop.id,
  background: shop.design.background_color,
  src: shop.design.custom_stamp_config?.icons?.[0]?.processed_url ?? "",
}));

/** Three shops' notification icons in a row, and the line about bringing your own. */
export function OwnIconCard() {
  return (
    <div>
      <div role="img" aria-label="Notification icons of three sample shops" className="flex gap-3">
        {TILES.map((tile) => (
          <span
            key={tile.id}
            data-icon-tile
            className="flex h-14 w-14 items-center justify-center rounded-[14px] shadow-[0_2px_6px_rgba(0,0,0,0.15)] ring-1 ring-black/5"
            style={{ backgroundColor: tile.background }}
          >
            <img src={tile.src} alt="" className="h-9 w-9 object-contain" />
          </span>
        ))}
      </div>
      <p className="mt-4 text-base text-pretty text-[var(--muted-foreground)]">{COPY.wallets.icon.line}</p>
    </div>
  );
}
