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
    <div className="my-8 p-6 text-center bg-[var(--accent)]/5 rounded-xl border border-[var(--accent)]/10">
      <p className="text-lg font-bold mb-3">{title}</p>
      <Link
        href={href}
        className="inline-flex items-center justify-center h-11 px-6 bg-[var(--accent)] text-white text-sm font-bold rounded-xl hover:brightness-110 shadow-lg shadow-[var(--accent)]/20 transition-all"
      >
        {buttonText}
      </Link>
    </div>
  );
}
