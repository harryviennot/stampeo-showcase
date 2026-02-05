'use client';

/**
 * QR Code skeleton component with wave animation.
 * Ported from scanner-app/src/components/skeleton/QRCodeSkeleton.tsx
 */

const GRID_SIZE = 9;
const SQUARE_SIZE = 10;
const GAP = 4;

// Fixed pattern mimicking QR code structure with finder patterns in corners
// 1 = visible square, 0 = empty
const QR_PATTERN = [
  [1, 1, 1, 0, 1, 0, 1, 1, 1],
  [1, 0, 1, 0, 0, 1, 1, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1],
  [0, 0, 0, 1, 0, 1, 0, 0, 0],
  [1, 0, 1, 1, 1, 0, 1, 0, 1],
  [0, 1, 0, 0, 1, 1, 0, 0, 0],
  [1, 1, 1, 0, 1, 0, 1, 1, 1],
  [1, 0, 1, 1, 0, 1, 1, 0, 1],
  [1, 1, 1, 0, 0, 0, 1, 1, 1],
];

interface QRCodeSkeletonProps {
  size?: number;
}

export function QRCodeSkeleton({ size = 100 }: QRCodeSkeletonProps) {
  const scale = size / ((GRID_SIZE * SQUARE_SIZE) + ((GRID_SIZE - 1) * GAP));
  const scaledSquareSize = SQUARE_SIZE * scale;
  const scaledGap = GAP * scale;

  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{
        width: size,
        height: size,
        gap: scaledGap,
      }}
    >
      {QR_PATTERN.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="flex"
          style={{ gap: scaledGap }}
        >
          {row.map((visible, colIndex) =>
            visible ? (
              <div
                key={colIndex}
                className="bg-[#e8e6e1] rounded-[2px]"
                style={{
                  width: scaledSquareSize,
                  height: scaledSquareSize,
                  animation: `qr-wave 900ms ease-in-out infinite`,
                  animationDelay: `${(rowIndex + colIndex) * 60}ms`,
                }}
              />
            ) : (
              <div
                key={colIndex}
                style={{
                  width: scaledSquareSize,
                  height: scaledSquareSize,
                }}
              />
            )
          )}
        </div>
      ))}

      {/* CSS keyframe animation */}
      <style jsx>{`
        @keyframes qr-wave {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}
