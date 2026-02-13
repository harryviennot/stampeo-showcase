import { Link } from "@/i18n/navigation";

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
      <Link
        href={href}
        className="inline-flex items-center justify-center h-11 px-6 bg-[var(--accent)] text-white text-sm font-bold rounded-full hover:brightness-110 shadow-lg shadow-[var(--accent)]/20 transition-all"
      >
        {buttonText} →
      </Link>
    </div>
  );
}
