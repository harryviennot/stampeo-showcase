import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Stampeo",
    short_name: "Stampeo",
    description:
      "Digital loyalty cards for Apple Wallet and Google Wallet. No app to download, no card to lose.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf8f5",
    theme_color: "#f97316",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
