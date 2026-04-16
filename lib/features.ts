import {
  PaletteIcon,
  CameraIcon,
  BellIcon,
  ChartIcon,
  MapPinIcon,
} from "@/components/icons";
import type { FeatureSlug } from "@/lib/feature-slugs";

export const FEATURE_ITEMS: ReadonlyArray<{
  key: string;
  canonicalSlug: FeatureSlug;
  Icon: typeof PaletteIcon;
}> = [
  { key: "designDeCarte", canonicalSlug: "design-de-carte", Icon: PaletteIcon },
  { key: "scannerMobile", canonicalSlug: "scanner-mobile", Icon: CameraIcon },
  { key: "notificationsPush", canonicalSlug: "notifications-push", Icon: BellIcon },
  { key: "analytiques", canonicalSlug: "analytiques", Icon: ChartIcon },
  { key: "geolocalisation", canonicalSlug: "geolocalisation", Icon: MapPinIcon },
];

export {
  FEATURES,
  FEATURE_SLUGS,
  type FeatureSlug,
  isValidSlug,
  generateFeatureStaticParams,
} from "@/lib/feature-slugs";
