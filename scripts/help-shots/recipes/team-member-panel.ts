import type { BrowserContext, Locator } from "playwright-core";
import { rosterOverlay } from "../lib/overlays";
import type { Recipe, Shot, ShotHelpers } from "../lib/types";

/** Owner names and addresses are replaced, and the scan figures the fixtures lack are filled in, in the browser only. */
const setup = (ctx: BrowserContext) =>
  rosterOverlay(ctx, {
    activity: {
      "sofia@aurevo.seed.stampeo.app": { scans: 143, hoursAgo: 2 },
      "yanis@aurevo.seed.stampeo.app": { scans: 38, hoursAgo: 72 },
    },
  });

/** Opens Sofia Alvarez's panel on the Team page and returns it. The viewport is made tall so the whole panel shows. */
export async function openSofia(h: ShotHelpers): Promise<Locator> {
  await h.open("/team");
  await h.tall(2400);
  await h.page.getByText("Sofia Alvarez", { exact: true }).first().click();
  const panel = h.page.getByRole("dialog");
  await panel.waitFor();
  await h.settle(1200);
  return panel;
}

/** Team features start on Growth (Activity): Aurevo (Growth, stamps). Pages split the shots; the setup is shared. */
export function teamRecipe(slug: string, shots: Shot[]): Recipe {
  return { slug, session: { account: "aurevo", device: "phone", setup }, shots };
}
