interface StampProps {
  className?: string;
  color?: string;
  size?: number;
  filled?: boolean;
}

// Circle stamp with check
export function CircleStamp({ className = "", color = "var(--stamp-coral)", size = 48, filled = true }: StampProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <circle
        cx="24"
        cy="24"
        r="22"
        fill={filled ? color : "transparent"}
        stroke={color}
        strokeWidth="2"
      />
      {filled && (
        <path
          d="M14 24L21 31L34 18"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

// Star stamp
export function StarStamp({ className = "", color = "var(--stamp-yellow)", size = 48, filled = true }: StampProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <path
        d="M24 4L29.4 17.6L44 19.2L33.2 29.2L36 44L24 37.2L12 44L14.8 29.2L4 19.2L18.6 17.6L24 4Z"
        fill={filled ? color : "transparent"}
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {filled && (
        <path
          d="M17 24L22 29L31 20"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

// Heart stamp
export function HeartStamp({ className = "", color = "var(--stamp-pink)", size = 48, filled = true }: StampProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <path
        d="M24 42L20.8 39.1C10.4 29.7 4 24 4 16.8C4 11 8.8 6 14.6 6C17.9 6 21 7.6 24 10.8C27 7.6 30.1 6 33.4 6C39.2 6 44 11 44 16.8C44 24 37.6 29.7 27.2 39.1L24 42Z"
        fill={filled ? color : "transparent"}
        stroke={color}
        strokeWidth="2"
      />
      {filled && (
        <path
          d="M16 22L22 28L32 18"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

// Coffee cup stamp
export function CoffeeStamp({ className = "", color = "var(--stamp-teal)", size = 48, filled = true }: StampProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <circle
        cx="24"
        cy="24"
        r="22"
        fill={filled ? color : "transparent"}
        stroke={color}
        strokeWidth="2"
      />
      {filled && (
        <>
          <path
            d="M14 20H30V32C30 34.2 28.2 36 26 36H18C15.8 36 14 34.2 14 32V20Z"
            fill="white"
            stroke="white"
            strokeWidth="2"
          />
          <path
            d="M30 22H32C34.2 22 36 23.8 36 26C36 28.2 34.2 30 32 30H30"
            stroke="white"
            strokeWidth="2"
          />
          <path d="M18 14C18 14 19 16 22 16C25 16 26 14 26 14" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

// Simple filled circle stamp (for small decorations)
export function DotStamp({ className = "", color = "var(--stamp-coral)", size = 16 }: StampProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <circle cx="8" cy="8" r="7" fill={color} />
    </svg>
  );
}

// Number stamp (for steps)
export function NumberStamp({
  className = "",
  color = "var(--stamp-coral)",
  size = 48,
  number = 1
}: StampProps & { number?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <circle cx="24" cy="24" r="22" fill={color} />
      <text
        x="24"
        y="24"
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize="20"
        fontWeight="700"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        {number}
      </text>
    </svg>
  );
}
