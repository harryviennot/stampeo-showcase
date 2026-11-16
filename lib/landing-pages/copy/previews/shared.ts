/**
 * What the six feature previews share: the sibling links a page closes with. Each card names a feature and says
 * in one plain line what it does for a customer or an owner.
 */
export const PREVIEW_SHARED = {
  related: {
    title: "More Stampeo features.",
    cards: {
      cardDesign: { title: "Card design", line: "Your logo, colors and stamp icons on the card." },
      mobileScanner: { title: "Scanner app", line: "Stamp cards from the app or any web browser." },
      pushNotifications: { title: "Push notifications", line: "Every stamp and reward on their lock screen." },
      analytics: { title: "Analytics", line: "Visits, return rate and your busiest hours." },
      promotionalCampaigns: { title: "Promotional campaigns", line: "One message to every customer's card." },
      geolocation: { title: "Geolocation", line: "Coming soon: your card when they walk by." },
    },
  },
} as const;
