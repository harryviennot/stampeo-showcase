import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
  size?: "default" | "lg";
  className?: string;
  onClick?: () => void;
}

export function Button({
  children,
  href,
  variant = "primary",
  size = "default",
  className = "",
  onClick,
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary:
      "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/25 focus:ring-amber-500 dark:from-amber-400 dark:to-orange-400 dark:hover:from-amber-500 dark:hover:to-orange-500",
    secondary:
      "border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--muted-foreground)] hover:bg-[var(--muted)] focus:ring-[var(--border)] bg-white/50 dark:bg-white/5",
  };

  const sizes = {
    default: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base",
  };

  const styles = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={styles}>
      {children}
    </button>
  );
}
