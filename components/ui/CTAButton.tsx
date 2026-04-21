import { Link } from "@/i18n/navigation";

type Size = "sm" | "md" | "lg" | "xl";
type Variant = "primary" | "secondary";

interface CTAButtonProps {
  label: string;
  href?: string;
  size?: Size;
  variant?: Variant;
  className?: string;
  id?: string;
  showArrow?: boolean;
}

const sizeStyles: Record<Size, string> = {
  sm: "h-11 px-6 text-sm",
  md: "px-8 py-3 text-base",
  lg: "px-8 py-4 text-lg",
  xl: "h-16 md:h-20 px-10 text-lg md:text-xl min-w-[280px] md:min-w-[340px] justify-center",
};

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-white shadow-xl shadow-[var(--accent)]/25 hover:scale-105 hover:brightness-110",
  secondary:
    "bg-white/10 text-white border border-white/10 hover:bg-white/20",
};

export function CTAButton({
  label,
  href = "/onboarding",
  size = "lg",
  variant = "primary",
  className = "",
  id,
  showArrow = true,
}: CTAButtonProps) {
  const base =
    "group inline-flex items-center gap-2 rounded-full font-bold transition-all";

  return (
    <Link
      id={id}
      href={href}
      className={`${base} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      <span>{label}</span>
      {showArrow && (
        <span className="transition-transform group-hover:translate-x-1">
          →
        </span>
      )}
    </Link>
  );
}
