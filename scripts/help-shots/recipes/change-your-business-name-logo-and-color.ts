import { englishBusiness, visibleLogo } from "../lib/overlays";
import type { Recipe } from "../lib/types";

/** Settings is owner-only and not gated by plan: Aurevo (Growth, stamps) as the owner. */
export const recipe: Recipe = {
  slug: "change-your-business-name-logo-and-color",
  session: { account: "aurevo", device: "phone", asOwner: true, business: (b) => visibleLogo(englishBusiness(b)) },
  shots: [
    {
      n: "01",
      shows: "the Business profile section: logo with Change, Adjust crop, Remove; name; brand color",
      async run(h) {
        await h.open("/settings");
        await h.tall(2600);
        await h.snap(h.page.locator("#profile"), { pad: 6 });
      },
    },
    {
      n: "02",
      shows: "the Remove your logo? confirmation",
      async run(h) {
        await h.open("/settings");
        await h.page.locator("#profile").getByRole("button", { name: "Remove", exact: true }).click();
        const dialog = h.page.getByRole("alertdialog");
        await dialog.waitFor();
        await h.settle(800);
        await h.snap(dialog);
      },
    },
  ],
};
