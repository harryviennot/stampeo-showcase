/**
 * The December seasonal card themes, each worn by one of the landing page's
 * sector brands, as the hero fan shows them while HERO_FAN_SEASON is
 * "christmas" (lib/hero-fan.ts).
 *
 * Each card is what "Add theme" makes for that business in the product: the
 * theme's look (colours, stamp icons, strip artwork) over the business's own
 * logo, stamp count and reward ladder. The artwork and icons in
 * public/themes/christmas/ are the theme's own images; the icons' grey and
 * outline copies are the backend's variants of each, as an upload produces them.
 *
 * Santa's Sleigh, Holly Jolly and Ugly Sweater suit both engines, so each has a
 * stamp card and a points card. Kept apart from loyalty-samples.ts on purpose:
 * those feed the card-design gallery, whose captions are zipped to the arrays
 * by index.
 */
import type { PointsSample, StampSample } from "@/lib/loyalty-samples";
import { themedIcon } from "@/lib/loyalty-samples";
import type { CardDesign } from "@/lib/types/design";

const art = (name: string) => `/themes/christmas/${name}`;
const icon = (name: string) => themedIcon(`christmas-${name}`, art(name), "webp");
/** An icon whose empty slots draw the backend's outline copy instead of the grey one. */
const outlined = (name: string) => ({ ...icon(name), outline_url: art(`${name}-outline.webp`) });

/** A reward ladder from three thresholds. */
const ladder = (...thresholds: [number, number, number]) =>
  thresholds.map((threshold, i) => ({ id: `r${i + 1}`, name: "", threshold }));

// Santa's Sleigh, Holly Jolly and Ugly Sweater: one look, two engines.
const SLEIGH: Partial<CardDesign> = {
  background_color: "#0E1436",
  foreground_color: "#FFECB2",
  label_color: "#A0B0FF",
  strip_background_color: "#090E2C",
  strip_background_url: art("santas-sleigh.webp"),
  strip_background_opacity: 85,
};
const HOLLY: Partial<CardDesign> = {
  background_color: "#0E3624",
  foreground_color: "#FFF6E4",
  label_color: "#F0C45C",
  strip_background_color: "#B21626",
  strip_background_opacity: 40,
};
const SWEATER: Partial<CardDesign> = {
  background_color: "#961220",
  foreground_color: "#FFF6E8",
  label_color: "#FFCF5A",
  strip_background_color: "#6E0A16",
  strip_background_url: art("ugly-sweater.webp"),
  strip_background_opacity: 35,
};

export const CHRISTMAS_STAMP_SAMPLES: StampSample[] = [
  // Little Santas on Aurevo: navy card, a pale winter-sky band of waving
  // Santas; the last stamp is Santa's sack.
  {
    id: "christmas-little-santas",
    design: {
      organization_name: "",
      logo_url: "/themes/cafe/logo.png",
      background_color: "#101E48",
      foreground_color: "#FFFFFF",
      label_color: "#FF9696",
      strip_background_color: "#D6ECFC",
      strip_background_url: art("little-santas.webp"),
      strip_background_opacity: 90,
      stamp_filled_color: "#E02A2F",
      stamp_empty_color: "#BED6EC",
      stamp_border_color: "#FFFFFF",
      icon_color: "#FFFFFF",
      progress_accent_color: "#101E48",
      stamp_icon: "checkmark",
      reward_icon: "gift",
      total_stamps: 8,
      stamp_icon_mode: "custom",
      custom_stamp_config: {
        icons: [icon("santa-wave"), icon("santa-gift"), icon("santa-cool")],
        reward_icon: icon("santa-sack"),
        empty_icon: null,
        empty_mode: "greyscale",
        arrangement: "straight",
        empty_opacity: 85,
      },
    },
    stamps: 5,
  },
  // Santa's Elves on Rolling Slice: forest-green card, gold labels, a stack of
  // elves at the workshop bench; the last stamp is a teddy bear.
  {
    id: "christmas-santas-elves",
    design: {
      organization_name: "",
      logo_url: "/themes/rolling-slice/logo.png",
      background_color: "#124E2E",
      foreground_color: "#FFF4DC",
      label_color: "#FFC85A",
      strip_background_url: art("santas-elves.webp"),
      strip_background_opacity: 90,
      stamp_filled_color: "#FFC85A",
      stamp_empty_color: "#1E643C",
      stamp_border_color: "#FFF4DC",
      icon_color: "#124E2E",
      stamp_icon: "checkmark",
      reward_icon: "gift",
      total_stamps: 8,
      stamp_icon_mode: "custom",
      custom_stamp_config: {
        icons: [icon("elf-bell"), icon("elf-girl"), icon("elf-hammer")],
        reward_icon: icon("teddy-bear"),
        empty_icon: null,
        empty_mode: "greyscale",
        arrangement: "overlap",
        empty_opacity: 85,
      },
    },
    stamps: 5,
  },
  // Reindeer Games on Rolling Slice: plum card over a twilight snowfield, the
  // reindeer in rotation with outlines for the stamps still to earn; jingle
  // bells on the last slot.
  {
    id: "christmas-reindeer-games",
    design: {
      organization_name: "",
      logo_url: "/themes/rolling-slice/logo.png",
      background_color: "#2C184E",
      foreground_color: "#FFECE4",
      label_color: "#FFA0BE",
      strip_background_color: "#24164F",
      strip_background_url: art("reindeer-games.webp"),
      strip_background_opacity: 75,
      stamp_filled_color: "#FFC478",
      stamp_empty_color: "#462C6E",
      stamp_border_color: "#FFA0BE",
      icon_color: "#2C184E",
      progress_accent_color: "#FFD68C",
      stamp_icon: "star",
      reward_icon: "gift",
      total_stamps: 8,
      stamp_icon_mode: "custom",
      custom_stamp_config: {
        icons: [
          outlined("reindeer-rudolph"),
          outlined("reindeer-scarf"),
          outlined("reindeer-hat"),
        ],
        reward_icon: outlined("jingle-bells"),
        empty_icon: null,
        empty_mode: "outline",
        arrangement: "straight",
        empty_opacity: 80,
      },
    },
    stamps: 5,
  },
  // Candy Cane on Vanity: solid candy red over a pale pink band; canes,
  // peppermints and baubles, a wrapped present at the end.
  {
    id: "christmas-candy-cane",
    design: {
      organization_name: "",
      logo_url: "/themes/salon/logo.png",
      background_color: "#C41628",
      foreground_color: "#FFFFFF",
      label_color: "#FFD0D6",
      strip_background_color: "#FFE2E6",
      stamp_filled_color: "#D62232",
      stamp_empty_color: "#FFC8D0",
      stamp_border_color: "#FFFFFF",
      icon_color: "#FFFFFF",
      stamp_icon: "checkmark",
      reward_icon: "gift",
      total_stamps: 8,
      stamp_icon_mode: "custom",
      custom_stamp_config: {
        icons: [icon("candy-cane"), icon("peppermint"), icon("bauble")],
        reward_icon: icon("present"),
        empty_icon: null,
        empty_mode: "greyscale",
        arrangement: "straight",
        empty_opacity: 40,
      },
    },
    stamps: 5,
  },
  // Gingerbread on Aurevo: chocolate-brown card, a gingerbread crowd
  // (overlap) in front of a snowy kitchen, a gingerbread house as the reward.
  {
    id: "christmas-gingerbread",
    design: {
      organization_name: "",
      logo_url: "/themes/cafe/logo.png",
      background_color: "#3A1C0E",
      foreground_color: "#FFE8CC",
      label_color: "#F0A05A",
      strip_background_url: art("gingerbread.webp"),
      strip_background_opacity: 85,
      stamp_filled_color: "#CF7A3C",
      stamp_empty_color: "#5A3018",
      stamp_border_color: "#FFE8CC",
      icon_color: "#3A1C0E",
      stamp_icon: "checkmark",
      reward_icon: "gift",
      total_stamps: 8,
      stamp_icon_mode: "custom",
      custom_stamp_config: {
        icons: [icon("gingerbread-smile"), icon("gingerbread-wink"), icon("gingerbread-santa")],
        reward_icon: icon("gingerbread-house"),
        empty_icon: null,
        empty_mode: "greyscale",
        arrangement: "overlap",
        empty_opacity: 80,
      },
    },
    stamps: 6,
  },
  // Snow Day on Gelo: midnight-blue card, snowmen in hats and earmuffs;
  // every empty slot is a snowball and the reward a snow globe.
  {
    id: "christmas-snow-day",
    design: {
      organization_name: "",
      logo_url: "/themes/gelo/logo.svg",
      background_color: "#0C1A38",
      foreground_color: "#EEF6FF",
      label_color: "#8CC4FF",
      strip_background_url: art("snow-day.webp"),
      strip_background_opacity: 85,
      stamp_filled_color: "#EEF6FF",
      stamp_empty_color: "#1A3058",
      stamp_border_color: "#8CC4FF",
      icon_color: "#0C1A38",
      stamp_icon: "checkmark",
      reward_icon: "gift",
      total_stamps: 8,
      stamp_icon_mode: "custom",
      custom_stamp_config: {
        icons: [icon("snowman-tophat"), icon("snowman-beanie"), icon("snowman-earmuffs")],
        reward_icon: icon("snow-globe"),
        empty_icon: icon("snowball"),
        empty_mode: "custom",
        arrangement: "straight",
        empty_opacity: 85,
      },
    },
    stamps: 7,
  },
  // Santa's Sleigh on Smash Club, stamp side: night-sky navy with the sleigh
  // crossing the moon, gold gift stamps.
  {
    id: "christmas-santas-sleigh-stamps",
    design: {
      ...SLEIGH,
      organization_name: "",
      logo_url: "/themes/smash-club/logo.png",
      stamp_filled_color: "#FFCF5A",
      stamp_empty_color: "#1A2250",
      stamp_border_color: "#A0B0FF",
      icon_color: "#0E1436",
      progress_accent_color: "#FFCF5A",
      stamp_icon: "gift",
      reward_icon: "star",
      total_stamps: 10,
      stamp_icon_mode: "preset",
    },
    stamps: 6,
  },
  // Holly Jolly on Aurevo, stamp side: holly green with a bright red band and
  // gold stars.
  {
    id: "christmas-holly-jolly-stamps",
    design: {
      ...HOLLY,
      organization_name: "",
      logo_url: "/themes/cafe/logo.png",
      stamp_filled_color: "#F0C45C",
      stamp_empty_color: "#8C0E1C",
      stamp_border_color: "#FFF6E4",
      icon_color: "#0E3624",
      progress_accent_color: "#FFF6E4",
      stamp_icon: "star",
      reward_icon: "gift",
      total_stamps: 8,
      stamp_icon_mode: "preset",
    },
    stamps: 5,
  },
  // Ugly Sweater on Rolling Slice, stamp side: knitted-red card over a
  // knit-pattern band, cream sparkle stamps on green.
  {
    id: "christmas-ugly-sweater-stamps",
    design: {
      ...SWEATER,
      organization_name: "",
      logo_url: "/themes/rolling-slice/logo.png",
      stamp_filled_color: "#F6EFE6",
      stamp_empty_color: "#1D6E3F",
      stamp_border_color: "#F6EFE6",
      icon_color: "#C8202E",
      progress_accent_color: "#FFF6E8",
      stamp_icon: "sparkle",
      reward_icon: "gift",
      total_stamps: 8,
      stamp_icon_mode: "preset",
    },
    stamps: 6,
  },
];

export const CHRISTMAS_POINTS_SAMPLES: PointsSample[] = [
  // Rudolph on Patoune: plum card, a reward track across a twilight hill with
  // Rudolph peeking over it.
  {
    id: "christmas-rudolph",
    design: {
      organization_name: "",
      logo_url: "/themes/patoune/logo.svg",
      card_type: "points",
      background_color: "#2C184E",
      foreground_color: "#FFECE4",
      label_color: "#FFA0BE",
      strip_background_color: "#24164F",
      strip_background_url: art("rudolph.webp"),
      strip_background_opacity: 80,
      progress_accent_color: "#FFD68C",
      points_strip_style: "progress_icons",
    },
    pointsBalance: 210,
    pointsRewards: ladder(150, 300, 600),
  },
  // North Pole on Marginalia: navy card, a pale polar band with the progress
  // ring in Santa red.
  {
    id: "christmas-north-pole",
    design: {
      organization_name: "",
      logo_url: "/themes/marginalia/logo.svg",
      card_type: "points",
      background_color: "#101E48",
      foreground_color: "#FFFFFF",
      label_color: "#FF9696",
      strip_background_color: "#D6ECFC",
      strip_background_url: art("north-pole.webp"),
      strip_background_opacity: 90,
      progress_accent_color: "#101E48",
      points_strip_style: "circle_progress",
    },
    pointsBalance: 240,
    pointsRewards: ladder(150, 300, 600),
  },
  // Elf Workshop on Pulp: forest-green card, a toy-workshop band with a
  // big gold balance.
  {
    id: "christmas-elf-workshop",
    design: {
      organization_name: "",
      logo_url: "/themes/pulp/logo.svg",
      card_type: "points",
      background_color: "#124E2E",
      foreground_color: "#FFF4DC",
      label_color: "#FFC85A",
      strip_background_color: "#3C1E0C",
      strip_background_url: art("elf-workshop.webp"),
      strip_background_opacity: 80,
      progress_accent_color: "#FFF8EB",
      points_strip_style: "big_point",
    },
    pointsBalance: 165,
    pointsRewards: ladder(250, 500, 1000),
  },
  // Northern Lights on Ravin: near-black teal card, aurora over a snowy ridge,
  // the ring filling in mint green.
  {
    id: "christmas-northern-lights",
    design: {
      organization_name: "",
      logo_url: "/themes/ravin/logo.svg",
      card_type: "points",
      background_color: "#061420",
      foreground_color: "#DCFFF0",
      label_color: "#6EE6BE",
      strip_background_color: "#040C18",
      strip_background_url: art("northern-lights.webp"),
      strip_background_opacity: 80,
      progress_accent_color: "#5AF0B4",
      points_strip_style: "circle_progress",
    },
    pointsBalance: 120,
    pointsRewards: ladder(150, 300, 500),
  },
  // Santa's Sleigh on Marginalia, points side: the same night sky, a reward
  // track in gold.
  {
    id: "christmas-santas-sleigh-points",
    design: {
      ...SLEIGH,
      organization_name: "",
      logo_url: "/themes/marginalia/logo.svg",
      card_type: "points",
      progress_accent_color: "#FFCF5A",
      points_strip_style: "progress_icons",
    },
    pointsBalance: 210,
    pointsRewards: ladder(150, 300, 600),
  },
  // Holly Jolly on Harvest Row, points side: holly green with a bright red
  // band and a huge balance.
  {
    id: "christmas-holly-jolly-points",
    design: {
      ...HOLLY,
      organization_name: "",
      logo_url: "/themes/harvest-row/logo.png",
      card_type: "points",
      progress_accent_color: "#FFF6E4",
      points_strip_style: "big_point",
    },
    pointsBalance: 140,
    pointsRewards: ladder(200, 400, 800),
  },
  // Ugly Sweater on Vanity, points side: knitted-red card over the knit band
  // with a big cream balance.
  {
    id: "christmas-ugly-sweater-points",
    design: {
      ...SWEATER,
      organization_name: "",
      logo_url: "/themes/salon/logo.png",
      card_type: "points",
      progress_accent_color: "#FFF6E8",
      points_strip_style: "big_point",
    },
    pointsBalance: 105,
    pointsRewards: ladder(150, 300, 600),
  },
];
