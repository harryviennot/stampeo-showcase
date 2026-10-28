import type { Locator } from "playwright-core";
import { englishBusiness } from "../lib/overlays";
import type { Recipe } from "../lib/types";

/** Settings is owner-only and not gated by plan: Aurevo (Growth, stamps) as the owner. */
export const recipe: Recipe = {
  slug: "set-your-time-zone",
  session: { account: "aurevo", device: "phone", asOwner: true, business: englishBusiness },
  shots: [
    {
      n: "01",
      shows: "Address and time zone: the Country and Time zone fields and the hint under Time zone",
      async run(h) {
        await h.open("/settings");
        await h.tall(2600);
        const section = h.page.locator("#address");
        // From the section title to the hint under Time zone: the street address below stays out.
        const hint: Locator = section.getByText("Your business's days run from midnight");
        await h.snapBand(section, { from: section, to: hint, padBottom: 18 });
      },
    },
    {
      n: "02",
      shows: 'the time zone list with "Paris" typed in the search',
      async run(h) {
        await h.open("/settings");
        await h.page.locator("#address").getByRole("button", { name: "Time zone" }).click();
        const dialog = h.page.getByRole("dialog");
        await h.page.getByPlaceholder("Search time zones…").fill("Paris");
        await dialog.getByText("Paris (GMT+1)").waitFor();
        await h.settle(800);
        await h.snapBand(dialog, { from: dialog.getByText("Time zone", { exact: true }), to: dialog.getByText("Paris (GMT+1)"), padTop: 8, padBottom: 12 });
      },
    },
  ],
};
