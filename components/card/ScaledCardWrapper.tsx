'use client';

import { useRef, useEffect, useState, ReactNode } from 'react';

interface ScaledCardWrapperProps {
  children: ReactNode;
  baseWidth?: number;
  aspectRatio?: number;
  minScale?: number;
}

export function ScaledCardWrapper({
  children,
  baseWidth = 280,
  aspectRatio = 1.282,
  minScale = 0.6,
}: ScaledCardWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const baseHeight = baseWidth * aspectRatio;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      const newScale = Math.max(minScale, width / baseWidth);
      setScale(newScale);
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [baseWidth, minScale]);

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
