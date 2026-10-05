import type { SectorTheme } from "@/lib/landing/sector-slides";

// Real, hand-designed cards for sample businesses: logos, colors and strip
// artwork match how an owner would set them up. Index i pairs with
// landing.sectorCards.sectors[i] in every messages/{locale}/landing.json, so
// new brands are appended, never inserted. The card fields come from the
// sector's `fields` in landing.json so they stay localized.
export const SECTOR_THEMES: SectorTheme[] = [
  // [0] Les Garçons Barbiers — classic barbershop. Crisp white card, near-black
  // scissor stamps, a gift on the final reward slot. Framed in warm charcoal
  // and brass so the white card pops.
  {
    id: "barber",
    engine: "stamp",
    cardBg: "#14110E",
    cardText: "#F4EFE9",
    cardMuted: "rgba(244,239,233,0.6)",
    accent: "#C9A15B",
    accentPill: "rgba(201,161,91,0.16)",
    walletBg: "#FFFFFF",
    walletAccent: "#040404",
    walletIcon: "#FFFFFF",
    walletText: "#343434",
    walletLabel: "#040404",
    walletLogoUrl: "/themes/barber/logo.avif",
    walletStamps: 6,
    walletFilled: 6, // reward slot filled → the gift shows
    walletStampIcon: "scissors",
    walletRewardIcon: "gift",
  },
  // [1] Aurevo — specialty café on stamps, using the brand's own to-go cup as a
  // custom uploaded icon. Coffee-brown card with the white wordmark; 8 cups
  // staggered across two rows, empty slots in greyscale. Framed in oat cream
  // and caramel to match the brown card.
  {
    id: "aurevo",
    engine: "stamp",
    cardBg: "#F4ECE0",
    cardText: "#2A2018",
    cardMuted: "rgba(42,32,24,0.62)",
    accent: "#A9743E",
    accentPill: "rgba(169,116,62,0.16)",
    walletBg: "#4b2e2b",
    walletAccent: "#3A2416",
    walletIcon: "#FFFFFF",
    walletLogoUrl: "/themes/cafe/logo.png",
    walletStamps: 8,
    customStampConfig: {
      icons: [
        {
          id: "aurevo-cup",
          original_url: "/themes/cafe/cup.png",
          processed_url: "/themes/cafe/cup.png",
          greyscale_url: "/themes/cafe/cup-grey.png",
          outline_url: "/themes/cafe/cup-grey.png",
          bg_removed: true,
        },
      ],
      reward_icon: null,
      empty_icon: null,
      empty_mode: "greyscale",
      arrangement: "overlap",
      empty_opacity: 80,
    },
  },
  // [2] Xeniká — Greek restaurant on points. White card, blue wordmark + blue
  // fields, and a full-bleed food photo as the strip (image_only, no overlay).
  // Framed in deep Aegean blue.
  {
    id: "xenika",
    engine: "points",
    cardBg: "#0A2C4D",
    cardText: "#EAF3FB",
    cardMuted: "rgba(234,243,251,0.62)",
    accent: "#4BA3E0",
    accentPill: "rgba(75,163,224,0.18)",
    walletBg: "#FFFFFF",
    walletAccent: "#0C64A4",
    walletIcon: "#FFFFFF",
    walletText: "#0C64A4",
    walletLabel: "#0C64A4",
    walletLogoUrl: "/themes/restaurant/logo.png",
    pointsStripStyle: "image_only",
    pointsBalance: 75,
    pointsRewards: [{ id: "r1", name: "", threshold: 100 }],
    stripBgColor: "#FFFFFF",
    stripImageUrl: "/themes/restaurant/strip.jpg",
    stripImageOpacity: 100,
  },
  // [3] Vanity — beauty/nail salon on points. Soft blush card carries the
  // cerise wordmark; a white strip holds a circle-progress ring in the brand
  // magenta. Framed in deep berry so the blush card reads.
  {
    id: "vanity",
    engine: "points",
    cardBg: "#2B0A1E",
    cardText: "#F9E9F1",
    cardMuted: "rgba(249,233,241,0.62)",
    accent: "#F08BB2",
    accentPill: "rgba(240,139,178,0.16)",
    walletBg: "#FADCE7",
    walletAccent: "#D6006E",
    walletIcon: "#FFFFFF",
    walletText: "#8A1150",
    walletLabel: "#B24A7B",
    walletLogoUrl: "/themes/salon/logo.png",
    pointsStripStyle: "circle_progress",
    pointsBalance: 65,
    pointsRewards: [
      { id: "r1", name: "", threshold: 80 },
      { id: "r2", name: "", threshold: 150 },
      { id: "r3", name: "", threshold: 300 },
    ],
    stripBgColor: "#FFFFFF",
  },
  // [4] Marginalia — independent bookstore on points, the big-balance strip in
  // gold on forest green (varying baskets, so points count what's spent).
  // Framed in deep pine so the green card still reads against it.
  {
    id: "marginalia",
    engine: "points",
    cardBg: "#0B2217",
    cardText: "#F3E9D6",
    cardMuted: "rgba(243,233,214,0.62)",
    accent: "#E4C67A",
    accentPill: "rgba(228,198,122,0.16)",
    walletBg: "#14432E",
    walletAccent: "#E4C67A",
    walletIcon: "#FFFFFF",
    walletText: "#F3E9D6",
    walletLabel: "#E4C67A",
    walletLogoUrl: "/themes/marginalia/logo.svg",
    pointsStripStyle: "big_point",
    pointsBalance: 240,
    pointsRewards: [
      { id: "r1", name: "", threshold: 150 },
      { id: "r2", name: "", threshold: 300 },
      { id: "r3", name: "", threshold: 600 },
    ],
  },
  // [5] Fournée — neighbourhood bakery on stamps, with a real croissant photo
  // as the stamp. Cream card, brown wordmark; framed in warm caramel.
  {
    id: "fournee",
    engine: "stamp",
    cardBg: "#C98B4A",
    cardText: "#2A1A0C",
    cardMuted: "rgba(42,26,12,0.68)",
    accent: "#2A1A0C",
    accentPill: "rgba(42,26,12,0.12)",
    walletBg: "#F7EBDD",
    walletAccent: "#4A2E17",
    walletIcon: "#FFFFFF",
    walletText: "#4A2E17",
    walletLabel: "#9A7351",
    walletLogoUrl: "/themes/fournee/logo.png",
    walletStamps: 10,
    walletFilled: 9,
    customStampConfig: {
      icons: [
        {
          id: "fournee-croissant",
          original_url: "/themes/fournee/croissant.png",
          processed_url: "/themes/fournee/croissant.png",
          greyscale_url: "/themes/fournee/croissant-grey.png",
          outline_url: "/themes/fournee/croissant-grey.png",
          bg_removed: true,
        },
      ],
      reward_icon: null,
      empty_icon: null,
      empty_mode: "greyscale",
      arrangement: "overlap",
      empty_opacity: 60,
    },
  },
  // [6] Lashwell — lash studio on stamps. Nude card, cocoa closed-eye stamps,
  // a sparkle on the reward slot; framed in cool cocoa.
  {
    id: "lashwell",
    engine: "stamp",
    cardBg: "#2E2230",
    cardText: "#F4E9E4",
    cardMuted: "rgba(244,233,228,0.62)",
    accent: "#E8C4B8",
    accentPill: "rgba(232,196,184,0.16)",
    walletBg: "#F4E9E4",
    walletAccent: "#2A1A16",
    walletIcon: "#F4E9E4",
    walletText: "#2A1A16",
    walletLabel: "#8C6F66",
    walletLogoUrl: "/themes/lashwell/logo.png",
    walletStamps: 6,
    walletFilled: 4,
    walletStampIcon: "eye-closed",
    walletRewardIcon: "sparkle",
  },
  // [7] Harvest Row — neighbourhood grocer on points (baskets vary), with a
  // milestone track: basket, percent, gift. Deep green card; framed in light
  // cream so it never reads as a second Bookstore.
  {
    id: "harvest-row",
    engine: "points",
    cardBg: "#F5EFE2",
    cardText: "#1F3A2A",
    cardMuted: "rgba(31,58,42,0.66)",
    accent: "#B8601A",
    accentPill: "rgba(242,165,65,0.2)",
    walletBg: "#1F4D36",
    walletAccent: "#F2A541",
    walletIcon: "#FFFFFF",
    walletText: "#F7F3E8",
    walletLabel: "#B7D88B",
    walletLogoUrl: "/themes/harvest-row/logo.png",
    pointsStripStyle: "progress_icons",
    pointsBalance: 165,
    pointsRewards: [
      { id: "r1", name: "", threshold: 100 },
      { id: "r2", name: "", threshold: 200 },
      { id: "r3", name: "", threshold: 400 },
    ],
    pointsRewardIcons: {
      r1: { type: "preset", ref: "basket" },
      r2: { type: "preset", ref: "percent" },
      r3: { type: "preset", ref: "gift" },
    },
  },
  // [8] Rolling Slice — pizza food truck on stamps, with a real pepperoni slice
  // photo as the stamp. Tomato-red card; framed in oven black.
  {
    id: "rolling-slice",
    engine: "stamp",
    cardBg: "#17110F",
    cardText: "#FFF4E2",
    cardMuted: "rgba(255,244,226,0.62)",
    accent: "#F7A98A",
    accentPill: "rgba(247,169,138,0.16)",
    walletBg: "#B8321C",
    walletAccent: "#FFF4E2",
    walletIcon: "#B8321C",
    walletText: "#FFF4E2",
    walletLabel: "#F7C9A8",
    walletLogoUrl: "/themes/rolling-slice/logo.png",
    walletStamps: 8,
    walletFilled: 5,
    customStampConfig: {
      icons: [
        {
          id: "rolling-slice-pizza",
          original_url: "/themes/rolling-slice/pizza.png",
          processed_url: "/themes/rolling-slice/pizza.png",
          greyscale_url: "/themes/rolling-slice/pizza-grey.png",
          outline_url: "/themes/rolling-slice/pizza-grey.png",
          bg_removed: true,
        },
      ],
      reward_icon: null,
      empty_icon: null,
      empty_mode: "greyscale",
      arrangement: "overlap",
      empty_opacity: 55,
    },
  },
  // [9] Saltmoss — day spa on stamps. Sage card, moss leaf stamps, a flower on
  // the reward slot; framed in dark moss.
  {
    id: "saltmoss",
    engine: "stamp",
    cardBg: "#1E2B22",
    cardText: "#E3E8DD",
    cardMuted: "rgba(227,232,221,0.62)",
    accent: "#A9C2A0",
    accentPill: "rgba(169,194,160,0.16)",
    walletBg: "#E3E8DD",
    walletAccent: "#4F6B55",
    walletIcon: "#E3E8DD",
    walletText: "#26352B",
    walletLabel: "#6F8370",
    walletLogoUrl: "/themes/saltmoss/logo.png",
    walletStamps: 6,
    walletFilled: 3,
    walletStampIcon: "leaf",
    walletRewardIcon: "flower",
  },
  // [10] Smash Club — burger joint on stamps, with a real cheeseburger photo as
  // the stamp. Charcoal card, mustard wordmark; framed in mustard cream.
  {
    id: "smash-club",
    engine: "stamp",
    cardBg: "#F8EBC8",
    cardText: "#2A1F0A",
    cardMuted: "rgba(42,31,10,0.66)",
    accent: "#8F5D07",
    accentPill: "rgba(242,180,29,0.24)",
    walletBg: "#181412",
    walletAccent: "#F2B41D",
    walletIcon: "#181412",
    walletText: "#FFF3D6",
    walletLabel: "#F2B41D",
    walletLogoUrl: "/themes/smash-club/logo.png",
    walletStamps: 10,
    walletFilled: 7,
    customStampConfig: {
      icons: [
        {
          id: "smash-club-burger",
          original_url: "/themes/smash-club/burger.png",
          processed_url: "/themes/smash-club/burger.png",
          greyscale_url: "/themes/smash-club/burger-grey.png",
          outline_url: "/themes/smash-club/burger-grey.png",
          bg_removed: true,
        },
      ],
      reward_icon: null,
      empty_icon: null,
      empty_mode: "greyscale",
      arrangement: "overlap",
      empty_opacity: 40,
    },
  },
];

/** Catalog indices in the order the carousel shows them. The subtitle's four
 *  examples lead; light and dark frames alternate so no more than two dark
 *  frames meet (loop wrap included), and the three green cards (Harvest Row,
 *  Saltmoss, Marginalia) never sit side by side. */
export const SECTOR_DISPLAY_ORDER: readonly number[] = [0, 1, 2, 3, 5, 6, 7, 8, 9, 10, 4];
