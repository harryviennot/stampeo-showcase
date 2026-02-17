import {
  PaletteIcon,
  CameraIcon,
  BellIcon,
  ChartIcon,
  MapPinIcon,
} from "@/components/icons";

export const FEATURE_ITEMS = [
  { key: "designDeCarte", slug: "design-de-carte", Icon: PaletteIcon },
  { key: "scannerMobile", slug: "scanner-mobile", Icon: CameraIcon },
  { key: "notificationsPush", slug: "notifications-push", Icon: BellIcon },
  { key: "analytiques", slug: "analytiques", Icon: ChartIcon },
  { key: "geolocalisation", slug: "geolocalisation", Icon: MapPinIcon },
] as const;
