import type { Locator, Page } from "playwright-core";
import type { Device } from "./devices";
import type { SessionSpec } from "./session";

/** What a shot's `run` can do. It ends by calling `snap` or `snapClip` once. */
export interface ShotHelpers {
  page: Page;
  /** Opens a dashboard route (relative to the dashboard base URL) and waits for it to settle. */
  open(route: string): Promise<void>;
  /** Waits for the page to stop loading and animating. */
  settle(ms?: number): Promise<void>;
  /** Makes the viewport taller (CSS px) so a long section or panel fits without inner scrolling. Reset after the shot. */
  tall(height: number): Promise<void>;
  /** Saves the element's box, padded by `pad` CSS px, as the shot. */
  snap(target: Locator, opts?: { pad?: number }): Promise<void>;
  /** Saves a horizontal band of `container`: its full width, from the top of `from` to the bottom of `to`, each padded by CSS px. */
  snapBand(container: Locator, band: { from: Locator; to: Locator; padTop?: number; padBottom?: number }): Promise<void>;
  /** Saves a clip of the viewport (CSS px) as the shot. */
  snapClip(clip: { x: number; y: number; width: number; height: number }): Promise<void>;
}

export interface Shot {
  /** Shot number, "01" upwards: the file is public/help/<slug>-<n>.png. */
  n: string;
  /** Overrides the recipe's owner view for this shot (an admin's view of an owner-only screen). */
  asOwner?: boolean;
  /** One line for --list: what the shot shows. */
  shows: string;
  run(h: ShotHelpers): Promise<void>;
}

export interface Recipe {
  /** The help page's slug: the PNGs are named after it. */
  slug: string;
  /** Who signs in, at what size, and the overlays: everything session.ts needs except the base URL and log. */
  session: Omit<SessionSpec, "appUrl" | "log">;
  shots: Shot[];
}

export type { Device };
