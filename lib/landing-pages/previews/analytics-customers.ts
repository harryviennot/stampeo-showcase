import type { ANALYTICS_PREVIEW } from "@/lib/landing-pages/copy/previews/analytics";

/** The segment keys the copy names, in the order the dashboard lists them. */
export type SegmentKey = (typeof ANALYTICS_PREVIEW.customers.segments)[number]["key"];

/** A segment's pill and avatar as the dashboard colours them: text and background of the pill, and the avatar. */
export const SEGMENT_LOOK: Record<SegmentKey, { color: string; background: string; avatar: string }> = {
  new: { color: "#3D7CAF", background: "#E4F0F8", avatar: "#3D7CAF" },
  regular: { color: "#3D6B3D", background: "#E8F5E4", avatar: "#5B8C5A" },
  vip: { color: "#C4883D", background: "#FFF3E0", avatar: "#C4883D" },
  rewardReady: { color: "#8A5A2B", background: "#FBEED9", avatar: "#B07B3E" },
  closeToReward: { color: "#3D6B3D", background: "#E8F5E4", avatar: "#4A7C59" },
  atRisk: { color: "#C75050", background: "#FDE8E4", avatar: "#C75050" },
  ghost: { color: "#6B6B6B", background: "#EDECEA", avatar: "#9A9A9A" },
};

/** The stamps on the sample café's card. */
export const CARD_STAMPS = 8;

/**
 * Seven customers as the dashboard's list shows them, one in each segment: the stamps on their 8-stamp card and
 * when they last came, in the dashboard's relative words. Every segment's rule is true of its customer.
 */
export const CUSTOMER_LIST: ReadonlyArray<{ name: string; stamps: number; segment: SegmentKey; lastVisit: string }> = [
  { name: "Maya Chen", stamps: 1, segment: "new", lastVisit: "Today" },
  { name: "Daniel Brooks", stamps: 4, segment: "regular", lastVisit: "Yesterday" },
  { name: "Priya Nair", stamps: 3, segment: "vip", lastVisit: "2d ago" },
  { name: "Tom Alvarez", stamps: 8, segment: "rewardReady", lastVisit: "3d ago" },
  { name: "Hannah Cole", stamps: 6, segment: "closeToReward", lastVisit: "1w ago" },
  { name: "Marcus Reed", stamps: 2, segment: "atRisk", lastVisit: "7w ago" },
  { name: "Ellie Park", stamps: 0, segment: "ghost", lastVisit: "3mo ago" },
];
