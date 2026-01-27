'use client';

import React, { useRef, useState } from "react";

export function LoyaltyCardPreview() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * 8;
    const rotateX = ((centerY - y) / centerY) * 8;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setRotate({ x: rotateX, y: rotateY });
    setGlare({ x: glareX, y: glareY, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      className="relative w-full max-w-[380px] mx-auto aspect-[10/12]"
      style={{ perspective: "1200px" }}
    >
      <div
        ref={cardRef}
        className="relative w-full h-full rounded-[1.5rem] cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease",
          boxShadow: `
            ${-rotate.y * 1.5}px ${rotate.x * 1.5 + 8}px 24px rgba(0,0,0,0.12),
            0 20px 50px rgba(0,0,0,0.08)
          `,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Card Content Layer - Apple Wallet Style */}
        <div className="absolute inset-0 rounded-[1.5rem] bg-[#1c1c1e] overflow-hidden">

          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-black/20" />

          {/* Content Layout */}
          <div className="relative h-full px-6 py-5 flex flex-col z-10">

            {/* Header: Logo/Brand Left, Stamp Count Right */}
            <div className="flex justify-between items-start ">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[var(--accent)] flex items-center justify-center">
                    <span className="text-white font-bold text-sm">CA</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[15px] text-white tracking-tight">Cafe Aroma</h3>
                    <p className="text-[12px] font-bold text-white/50 uppercase tracking-wider">Loyalty Card</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[12px] font-bold text-white/50 uppercase tracking-wider">Stamps</div>
                <div className="text-xl font-medium text-white flex items-baseline gap-1 justify-end">
                  5 / 8
                </div>
              </div>
            </div>

            {/* Middle: Stamps Grid */}
            <div className="flex flex-col justify-center gap-6 w-full my-6">
              {/* Row 1 */}
              <div className="flex justify-between w-full px-2">
                {[...Array(4)].map((_, i) => (
                  <Stamp key={i} index={i} />
                ))}
              </div>
              {/* Row 2 */}
              <div className="flex justify-between w-full px-2">
                {[...Array(4)].map((_, i) => (
                  <Stamp key={i + 4} index={i + 4} />
                ))}
              </div>
            </div>

            {/* Footer: Reward info */}
            <div className="border-white/10">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[12px] font-bold text-white/50 uppercase tracking-wider">Reward</p>
                  <p className="text-[16px] text-white/90">Free coffee at 8 stamps</p>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="mt-auto pt-4 flex justify-center">
              <div className="bg-white p-2 rounded-lg">
                <FakeQRCode size={100} />
              </div>
            </div>

          </div>
        </div>

        {/* Glare Effect */}
        <div
          className="absolute inset-0 rounded-[1.5rem] pointer-events-none z-20"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)`,
            opacity: glare.opacity,
            transition: 'opacity 0.5s ease',
          }}
        />

        {/* Border */}
        <div
          className="absolute inset-0 rounded-[1.5rem] pointer-events-none z-30"
          style={{
            boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.1)`
          }}
        />
      </div>
    </div>
  );
}

function Stamp({ index }: { index: number }) {
  const isFilled = index < 5;
  return (
    <div className="flex justify-center">
      <div
        className={`
          w-16 h-16 sm:w-13 sm:h-13 rounded-full flex items-center justify-center transition-all duration-300
          ${isFilled
            ? "bg-[var(--accent)] shadow-lg shadow-orange-500/30"
            : "bg-white/10 border border-white/20"
          }
        `}
      >
        {isFilled && (
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </div>
  );
}

function FakeQRCode({ size = 80 }: { size?: number }) {
  // Generate a deterministic pattern that looks like a QR code
  const modules = 21; // Standard QR code size
  const moduleSize = size / modules;

  // QR codes have finder patterns in 3 corners
  const isFinderPattern = (row: number, col: number) => {
    // Top-left finder
    if (row < 7 && col < 7) return true;
    // Top-right finder
    if (row < 7 && col >= modules - 7) return true;
    // Bottom-left finder
    if (row >= modules - 7 && col < 7) return true;
    return false;
  };

  const isFinderInner = (row: number, col: number) => {
    // Check if inside the white border of finder patterns
    const checkInner = (r: number, c: number, startR: number, startC: number) => {
      const relR = r - startR;
      const relC = c - startC;
      if (relR >= 1 && relR <= 5 && relC >= 1 && relC <= 5) {
        if (relR >= 2 && relR <= 4 && relC >= 2 && relC <= 4) {
          return 'black';
        }
        return 'white';
      }
      return 'black';
    };

    if (row < 7 && col < 7) return checkInner(row, col, 0, 0);
    if (row < 7 && col >= modules - 7) return checkInner(row, col, 0, modules - 7);
    if (row >= modules - 7 && col < 7) return checkInner(row, col, modules - 7, 0);
    return null;
  };

  // Seeded random for consistent pattern
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
  };

  const getModuleColor = (row: number, col: number) => {
    // Timing patterns
    if (row === 6 && col >= 8 && col <= modules - 9) {
      return col % 2 === 0 ? '#000' : '#fff';
    }
    if (col === 6 && row >= 8 && row <= modules - 9) {
      return row % 2 === 0 ? '#000' : '#fff';
    }

    // Finder patterns
    if (isFinderPattern(row, col)) {
      const inner = isFinderInner(row, col);
      return inner === 'white' ? '#fff' : '#000';
    }

    // Separator (white border around finders)
    if (
      (row === 7 && col < 8) || (col === 7 && row < 8) ||
      (row === 7 && col >= modules - 8) || (col === modules - 8 && row < 8) ||
      (row === modules - 8 && col < 8) || (col === 7 && row >= modules - 8)
    ) {
      return '#fff';
    }

    // Random data modules
    const seed = row * modules + col;
    return seededRandom(seed) > 0.5 ? '#000' : '#fff';
  };

  const rects = [];
  for (let row = 0; row < modules; row++) {
    for (let col = 0; col < modules; col++) {
      const color = getModuleColor(row, col);
      if (color === '#000') {
        rects.push(
          <rect
            key={`${row}-${col}`}
            x={col * moduleSize}
            y={row * moduleSize}
            width={moduleSize}
            height={moduleSize}
            fill="#000"
          />
        );
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="#fff" />
      {rects}
    </svg>
  );
}
