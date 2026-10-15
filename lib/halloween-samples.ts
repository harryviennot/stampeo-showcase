/**
 * The October seasonal card themes, each worn by one of the landing page's
 * sector brands, as the hero fan shows them while HERO_FAN_SEASON is
 * "halloween" (lib/hero-fan.ts).
 *
 * Each card is what "Add theme" makes for that business in the product: the
 * theme's look (colours, stamp icons, strip artwork) over the business's own
 * logo, stamp count and reward ladder. The artwork and icons in
 * public/themes/halloween/ are the theme's own images; the icons' grey copies
 * are the backend's greyscale variant of each, as an upload produces them.
 *
 * Kept apart from loyalty-samples.ts on purpose: those feed the card-design
 * gallery, whose captions are zipped to the arrays by index.
 */
import type { PointsSample, StampSample } from "@/lib/loyalty-samples";
import { themedIcon } from "@/lib/loyalty-samples";

const art = (name: string) => `/themes/halloween/${name}`;
const icon = (name: string) => themedIcon(`halloween-${name}`, art(name), "webp");

export const HALLOWEEN_STAMP_SAMPLES: StampSample[] = [
  // Pumpkin Night on Les Garçons Barbiers: pumpkin-orange card, a jet-black
  // band where orange ghost stamps glow, a gift on the last slot.
  {
    id: "halloween-pumpkin-night",
    design: {
      organization_name: "",
      logo_url: "/themes/barber/logo.avif",
      background_color: "#FF7A00",
      foreground_color: "#180C04",
      label_color: "#6E2C00",
      strip_background_color: "#160C06",
      stamp_filled_color: "#FF7A00",
      stamp_empty_color: "#2C1A0E",
      stamp_border_color: "#A85000",
      icon_color: "#160C06",
      stamp_icon: "ghost",
      reward_icon: "gift",
      total_stamps: 6,
    },
    stamps: 5,
  },
  // Jack-o'-Lantern on Smash Club: a crowd of carved pumpkins (overlap) in
  // front of a harvest moon, a crowned golden pumpkin as the reward.
  {
    id: "halloween-jack-o-lantern",
    design: {
      organization_name: "",
      logo_url: "/themes/smash-club/logo.png",
      background_color: "#180905",
      foreground_color: "#FFCC80",
      label_color: "#FF8A28",
      stamp_filled_color: "#FF8A00",
      icon_color: "#180905",
      strip_background_url: art("harvest-woods.webp"),
      strip_background_opacity: 80,
      total_stamps: 10,
      stamp_icon_mode: "custom",
      custom_stamp_config: {
        icons: [icon("pumpkin-classic"), icon("pumpkin-spooky"), icon("pumpkin-cute")],
        reward_icon: icon("pumpkin-golden"),
        empty_icon: null,
        empty_mode: "greyscale",
        arrangement: "overlap",
        empty_opacity: 45,
      },
    },
    stamps: 8,
  },
  // Ghostly Graveyard on Rolling Slice: every empty slot is a tombstone and
  // every stamp a ghost; the reward ghost wears a witch hat.
  {
    id: "halloween-ghostly-graveyard",
    design: {
      organization_name: "",
      logo_url: "/themes/rolling-slice/logo.png",
      background_color: "#0A1820",
      foreground_color: "#E2FFF8",
      label_color: "#7ADEC8",
      stamp_filled_color: "#E2FFF8",
      icon_color: "#0A1820",
      strip_background_url: art("graveyard.webp"),
      strip_background_opacity: 85,
      total_stamps: 8,
      stamp_icon_mode: "custom",
      custom_stamp_config: {
        icons: [icon("ghost-happy"), icon("ghost-boo"), icon("ghost-wink")],
        reward_icon: icon("ghost-witch"),
        empty_icon: icon("tombstone"),
        empty_mode: "custom",
        arrangement: "straight",
        empty_opacity: 90,
      },
    },
    stamps: 6,
  },
  // Trick or Treat on Aurevo: candy corn, wrapped sweets and swirl lollipops
  // on a deep purple band; the last stamp is a pail full of candy.
  {
    id: "halloween-trick-or-treat",
    design: {
      organization_name: "",
      logo_url: "/themes/cafe/logo.png",
      background_color: "#4C1D95",
      foreground_color: "#FFFFFF",
      label_color: "#FFB86C",
      strip_background_color: "#34116C",
      stamp_filled_color: "#FF8A00",
      icon_color: "#FFFFFF",
      total_stamps: 8,
      stamp_icon_mode: "custom",
      custom_stamp_config: {
        icons: [icon("candy-corn"), icon("wrapped-candy"), icon("lollipop")],
        reward_icon: icon("candy-bucket"),
        empty_icon: null,
        empty_mode: "greyscale",
        arrangement: "straight",
        empty_opacity: 40,
      },
    },
    stamps: 6,
  },
];

export const HALLOWEEN_POINTS_SAMPLES: PointsSample[] = [
  // Witch's Brew on Vanity: a bubbling cauldron and a witch crossing the moon;
  // the ring fills up like a potion.
  {
    id: "halloween-witches-brew",
    design: {
      organization_name: "",
      logo_url: "/themes/salon/logo.png",
      card_type: "points",
      background_color: "#18082C",
      foreground_color: "#C6FFA0",
      label_color: "#B092EC",
      strip_background_color: "#120622",
      strip_background_url: art("witches-brew.webp"),
      strip_background_opacity: 75,
      progress_accent_color: "#8CFF5A",
      points_strip_style: "circle_progress",
    },
    pointsBalance: 105,
    pointsRewards: [
      { id: "r1", name: "", threshold: 80 },
      { id: "r2", name: "", threshold: 150 },
      { id: "r3", name: "", threshold: 300 },
    ],
  },
  // Haunted Moon on Marginalia: a reward track over a haunted hill, bats and
  // a lit-up manor under the full moon.
  {
    id: "halloween-haunted-moon",
    design: {
      organization_name: "",
      logo_url: "/themes/marginalia/logo.svg",
      card_type: "points",
      background_color: "#1E0E36",
      foreground_color: "#FFE9A8",
      label_color: "#BAA0EC",
      strip_background_color: "#0E0726",
      strip_background_url: art("haunted-moon.webp"),
      strip_background_opacity: 90,
      progress_accent_color: "#FFD666",
      points_strip_style: "progress_icons",
    },
    pointsBalance: 210,
    pointsRewards: [
      { id: "r1", name: "", threshold: 150 },
      { id: "r2", name: "", threshold: 300 },
      { id: "r3", name: "", threshold: 600 },
    ],
  },
  // Blood Moon on Harvest Row: near-black card, a blood-red band and a huge
  // bone-white balance.
  {
    id: "halloween-blood-moon",
    design: {
      organization_name: "",
      logo_url: "/themes/harvest-row/logo.png",
      card_type: "points",
      background_color: "#120608",
      foreground_color: "#FFECD6",
      label_color: "#E24848",
      strip_background_color: "#840A18",
      progress_accent_color: "#FFECD6",
      points_strip_style: "big_point",
    },
    pointsBalance: 140,
    pointsRewards: [
      { id: "r1", name: "", threshold: 100 },
      { id: "r2", name: "", threshold: 200 },
      { id: "r3", name: "", threshold: 400 },
    ],
  },
];
