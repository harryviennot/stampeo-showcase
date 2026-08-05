'use client';

import { useRef, useEffect, useState, ReactNode } from 'react';

/** The three sizes a wallet card is allowed to render at, in px. */
const SIZE_WIDTHS = { sm: 200, md: 280, lg: 340 } as const;

type CardSize = keyof typeof SIZE_WIDTHS;

interface ScaledCardWrapperProps {
  children: ReactNode;
  /**
   * Renders the card at one of three fixed widths. Prefer this over
   * targetWidth: the card is the site's hero object and it used to appear at
   * nine different sizes, which read as inconsistent zoom.
   */
  size?: CardSize;
  /** Width at which content is laid out (before scaling) */
  baseWidth?: number;
  /** Escape hatch for a bespoke visual width. Ignored when `size` is set. */
  targetWidth?: number;
  aspectRatio?: number;
  minScale?: number;
}

export function ScaledCardWrapper({
  children,
  size,
  baseWidth = 280,
  targetWidth: targetWidthProp,
  aspectRatio = 1.282,
  minScale = 0.6,
}: ScaledCardWrapperProps) {
  const targetWidth = size ? SIZE_WIDTHS[size] : targetWidthProp;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const baseHeight = baseWidth * aspectRatio;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      // Scale based on parent width relative to baseWidth
      // If targetWidth is set, use it to calculate the reference for scaling
      const referenceWidth = targetWidth || baseWidth;
      const newScale = Math.max(minScale, width / referenceWidth) * (targetWidth ? targetWidth / baseWidth : 1);
      setScale(newScale);
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [baseWidth, targetWidth, minScale]);

  return (
    <div
      ref={containerRef}
      className="w-full"
      style={{ height: baseHeight * scale }}
    >
      <div
        style={{
          width: baseWidth,
          height: baseHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    </div>
  );
}
