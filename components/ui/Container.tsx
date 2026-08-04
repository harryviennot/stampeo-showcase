type ContainerSize = "default" | "narrow";

interface ContainerProps {
  children: React.ReactNode;
  /** `narrow` is for reading columns — FAQ answers, the ROI calculator. */
  size?: ContainerSize;
  className?: string;
}

const sizeClasses: Record<ContainerSize, string> = {
  default: "max-w-[1360px]",
  narrow: "max-w-[840px]",
};

/**
 * The only content width on the site. Section edges line up when you scroll
 * because everything — landing, pricing, features — goes through here.
 *
 * Width is set so content starts ~72px from the edge of a 1440px screen.
 * Measured for comparison: Cursor sits at 70px, Linear at 48px. A narrower
 * page with fat side margins is the thing that reads as timid rather than
 * premium. Phones keep a 16px gutter, which is where everyone lands.
 */
export function Container({
  children,
  size = "default",
  className = "",
}: ContainerProps) {
  return (
    <div className={`mx-auto ${sizeClasses[size]} px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
