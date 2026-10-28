import type { Recipe } from "../lib/types";

/** Owner-only button, shown on every plan: Aurevo (Growth, stamps) as the owner. */
export const recipe: Recipe = {
  slug: "export-your-customer-list",
  session: { account: "aurevo", device: "phone", asOwner: true },
  shots: [
    {
      n: "01",
      shows: "the top of Customers with the Export button",
      async run(h) {
        await h.open("/customers");
        // Header only: title, subtitle and the Export button, never the customer list below.
        await h.snapClip({ x: 0, y: 0, width: 402, height: 124 });
      },
    },
  ],
};
