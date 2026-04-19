import {
  PaletteIcon,
  CameraIcon,
  BellIcon,
  ChartIcon,
  MapPinIcon,
  MegaphoneIcon,
} from "@/components/icons";
import type { FeatureSlug } from "@/lib/feature-slugs";

export const FEATURE_ITEMS: ReadonlyArray<{
  key: string;
  canonicalSlug: FeatureSlug;
  Icon: typeof PaletteIcon;
}> = [
  { key: "notificationsPush", canonicalSlug: "notifications-push", Icon: BellIcon },
  { key: "campagnesPromotionnelles", canonicalSlug: "campagnes-promotionnelles", Icon: MegaphoneIcon },
  { key: "geolocalisation", canonicalSlug: "geolocalisation", Icon: MapPinIcon },
  { key: "scannerMobile", canonicalSlug: "scanner-mobile", Icon: CameraIcon },
  { key: "analytiques", canonicalSlug: "analytiques", Icon: ChartIcon },
  { key: "designDeCarte", canonicalSlug: "design-de-carte", Icon: PaletteIcon },
];

export {
  FEATURES,
  FEATURE_SLUGS,
  type FeatureSlug,
  isValidSlug,
  generateFeatureStaticParams,
} from "@/lib/feature-slugs";
