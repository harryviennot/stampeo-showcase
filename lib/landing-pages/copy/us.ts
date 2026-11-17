import type { LandingCopy } from "./bundle";
import type { DeepPartial } from "./widen";

/**
 * What the US pages say in place of the international English: "punch card" where the world says "stamp card" or
 * "loyalty card". Laid over the English words when a page's locale is `en` and its market is `us`
 * (`landingCopy`); a list entry that is `undefined` keeps the word it has.
 */
export const US_WORDS = {
  platform: {
    PLATFORM: {
      meta: {
        title: "Digital punch cards for Apple & Google Wallet | Stampeo",
        description:
          "Create, share and stamp a digital punch card in Apple Wallet and Google Wallet, run from a dashboard and a free Scanner app. Free trial, cancel anytime.",
      },
      hero: { h1: "Digital punch cards for Apple & Google Wallet." },
    },
  },
  previews: {
    cardDesign: {
      CARD_DESIGN_PREVIEW: {
        faq: {
          items: [
            undefined,
            undefined,
            {
              question: "Can I make a digital punch card or a points card?",
              answer:
                "Both. A stamp card works like a paper punch card, with a stamp for each visit. A points card rewards what they spend. Add levels to either, and switch later without your customers losing their card.",
            },
          ],
        },
      },
    },
    loyaltyPrograms: {
      LOYALTY_PROGRAMS_PREVIEW: {
        faq: {
          items: [
            undefined,
            undefined,
            undefined,
            undefined,
            {
              question: "Can I make a digital punch card?",
              answer:
                "Yes. A stamp card works like a paper punch card, with a stamp for each visit, but it lives in Apple Wallet or Google Wallet and can't be lost.",
            },
          ],
        },
      },
    },
  },
} satisfies DeepPartial<LandingCopy>;
