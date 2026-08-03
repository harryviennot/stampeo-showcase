import { notFound } from "next/navigation";
import { Studio, type MessagesByLocale } from "./Studio";

// The scenes need the "common" namespace (WalletCard/PointsStrip labels) and
// "features" (the card-design gallery's per-brand cardFields), per locale.
import frCommon from "@/messages/fr/common.json";
import frFeatures from "@/messages/fr/features.json";
import enCommon from "@/messages/en/common.json";
import enFeatures from "@/messages/en/features.json";
import esCommon from "@/messages/es/common.json";
import esFeatures from "@/messages/es/features.json";

// The cast matches how the app loads these same files: i18n/request.ts pulls
// them through untyped dynamic imports. AbstractIntlMessages doesn't model
// JSON arrays (cardFields), but next-intl handles them at runtime via t.raw.
const MESSAGES_BY_LOCALE = {
  en: { ...enCommon, ...enFeatures },
  fr: { ...frCommon, ...frFeatures },
  es: { ...esCommon, ...esFeatures },
} as unknown as MessagesByLocale;

export default function ChangelogGraphicsPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <Studio messagesByLocale={MESSAGES_BY_LOCALE} />;
}
