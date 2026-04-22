import { CTAButton } from "@/components/ui/CTAButton";

export function CallToAction({
  title,
  buttonText,
  href = "/onboarding",
}: {
  title: string;
  buttonText: string;
  href?: string;
}) {
  return (
    <div className="not-prose my-8 p-8 text-center bg-white rounded-2xl blog-card-3d">
      <p className="text-lg font-bold mb-4 text-[var(--near-black)]">
        <span className="blog-highlight">{title}</span>
      </p>
      <CTAButton label={buttonText} href={href} size="sm" />
    </div>
  );
}
