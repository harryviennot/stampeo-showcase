/**
 * What the six feature previews share: the sibling links a page closes
 * with. The cards name a feature and say what it does in the words of that
 * feature's own hero; the broadcasts card carries no plan badge, as Platform's
 * broadcast fact does.
 */
export const PREVIEW_SHARED = {
  related: {
    title: "See the rest of the platform.",
    cards: {
      cardDesign: { title: "Card design", line: "A loyalty card that looks like your shop." },
      mobileScanner: { title: "Scanner app", line: "One scan, one stamp, from any phone." },
      pushNotifications: { title: "Notifications", line: "Every stamp lands on their lock screen." },
      analytics: { title: "Analytics", line: "See how often your customers come back." },
      promotionalCampaigns: { title: "Broadcasts", line: "Bring customers back with one message." },
      geolocation: { title: "Geolocation", line: "Soon, your card will appear when they walk by." },
    },
  },
} as const;
