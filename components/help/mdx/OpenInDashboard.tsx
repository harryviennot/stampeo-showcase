import { ArrowSquareOutIcon } from "@/components/icons";
import { ctaBase, ctaSizeStyles, ctaVariantStyles } from "@/components/ui/cta-styles";
import { dashboardUrl } from "@/lib/help/links";

/**
 * A button to the dashboard screen a page documents, in a new tab. A plain
 * anchor wearing the CTA look: the CTAButton itself would report a signup-funnel
 * click and add a locale prefix.
 */
export function OpenInDashboard({ path, label = "Open in dashboard" }: { path: string; label?: string }) {
  return (
    // not-prose keeps the article's link colour off the button text.
    <div className="not-prose my-6">
      <a
        href={dashboardUrl(path)}
        target="_blank"
        rel="noopener"
        className={`w-full sm:w-auto ${ctaBase} ${ctaSizeStyles.md} ${ctaVariantStyles.primary}`}
      >
        <span>{label}</span>
        <ArrowSquareOutIcon aria-hidden className="h-4 w-4" weight="bold" />
      </a>
    </div>
  );
}
