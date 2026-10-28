import type { BrowserContext } from "playwright-core";
import { designOverlay, englishBusiness, englishDesign } from "../lib/overlays";
import type { Recipe, ShotHelpers } from "../lib/types";

const setup = (ctx: BrowserContext) => designOverlay(ctx, englishDesign);

/** Opens the Opening Hours line and moves Saturday's closing time to 17:00 (an edit on the page, never saved). */
async function editSaturday(h: ShotHelpers) {
  const section = h.page.locator("#card-back");
  await section.getByRole("button", { name: /Opening Hours/ }).click();
  await section.locator('input[type="time"]').nth(3).fill("17:00");
  await h.page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await h.settle(600);
  return section;
}

/** Settings is owner-only and not gated by plan: Aurevo (Growth, stamps) as the owner. */
export const recipe: Recipe = {
  slug: "update-your-opening-hours-and-contact-details",
  session: { account: "aurevo", device: "phone", asOwner: true, business: englishBusiness, setup },
  shots: [
    {
      n: "01",
      shows: "On your customers' cards: the lines with their summaries and Add info",
      async run(h) {
        await h.open("/settings");
        await h.tall(2600);
        await h.snap(h.page.locator("#card-back"), { pad: 6 });
      },
    },
    {
      n: "02",
      shows: "the Opening Hours line open, Saturday closing at 17:00, Sunday closed",
      async run(h) {
        await h.open("/settings");
        await h.tall(2600);
        const section = await editSaturday(h);
        const remove = section.getByRole("button", { name: "Remove", exact: true });
        await h.snapBand(section, { from: section, to: remove, padBottom: 14 });
      },
    },
    {
      n: "03",
      shows: "the Back of your card preview (the Preview sheet on a phone)",
      async run(h) {
        await h.open("/settings");
        await h.page.locator("#card-back").getByRole("button", { name: /Preview/ }).click();
        const dialog = h.page.getByRole("dialog");
        await dialog.waitFor();
        await h.settle(1200);
        const title = dialog.getByText("Back of your card", { exact: true });
        await h.snapBand(dialog, { from: title, to: dialog.getByRole("link", { name: /Card style/ }), padTop: 14, padBottom: 14 });
      },
    },
    {
      n: "04",
      shows: "the Save bar with Discard and Save changes after one unsaved edit",
      async run(h) {
        await h.open("/settings");
        // A viewport taller than the page puts the bar after the last card, with only plain background behind it.
        await h.tall(5000);
        await editSaturday(h);
        await h.snap(h.page.locator("div.sticky.bottom-0").filter({ has: h.page.getByRole("button", { name: "Save changes" }) }));
      },
    },
  ],
};
