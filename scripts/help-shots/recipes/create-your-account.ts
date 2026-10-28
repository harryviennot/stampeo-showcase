import type { Recipe } from "../lib/types";

/** The public sign-up on the dev showcase. Nothing is submitted: the email and password form is never reached. */
export const recipe: Recipe = {
  slug: "create-your-account",
  session: { device: "phone" },
  shots: [
    {
      n: "01",
      shows: "Let's get to know you, with a made-up name typed in Your name",
      async run(h) {
        await h.open("/en/onboarding");
        await h.page.getByLabel("Your name").fill("Priya Shah");
        await h.page.getByLabel("Your name").blur();
        await h.settle(600);
        const card = h.page.getByRole("heading", { name: "Let's get to know you" }).locator("xpath=ancestor::*[contains(@class,'rounded')][1]");
        await h.snap(card, { pad: 8 });
      },
    },
    {
      n: "02",
      shows: "How would you like to create your account? with Google, Apple and email",
      async run(h) {
        await h.open("/en/onboarding");
        await h.page.getByLabel("Your name").fill("Priya Shah");
        await h.page.getByRole("button", { name: "Continue", exact: true }).click();
        const heading = h.page.getByRole("heading", { name: /How would you like to create your account/ });
        await heading.waitFor();
        await h.settle(800);
        const card = heading.locator("xpath=ancestor::*[contains(@class,'rounded')][1]");
        await h.snap(card, { pad: 8 });
      },
    },
  ],
};
