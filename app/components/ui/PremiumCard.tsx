"use client";

import React, { useRef, useState } from "react";

export function PremiumCard() {
    const cardRef = useRef<HTMLDivElement>(null);
    const [rotate, setRotate] = useState({ x: 0, y: 0 });
    const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate rotation (Reduced max rotation to 8 degrees for subtlety)
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateY = ((x - centerX) / centerX) * 8;
        const rotateX = ((centerY - y) / centerY) * 8;

        // Calculate glare position (in %)
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
            className="relative w-full max-w-[420px] mx-auto aspect-[1.586/1]"
            style={{ perspective: "1200px" }}
        >
            <div
                ref={cardRef}
                className="relative w-full h-full rounded-[2rem] cursor-pointer"
                style={{
                    transformStyle: "preserve-3d",
                    transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
                    // Slower, smoother transition for "heavy" premium feel
                    transition: "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.4s ease",
                    boxShadow: `
            ${-rotate.y * 1.5}px ${rotate.x * 1.5 + 5}px 20px rgba(0,0,0,0.15),
            0 15px 40px rgba(0,0,0,0.1)
          `,
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* Card Content Layer - Titanium Finish */}
                <div className="absolute inset-0 rounded-[2rem] bg-[#f2f2f5] overflow-hidden border border-white/60">

                    {/* Subtle noise texture */}
                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-multiply"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                    />

                    {/* Subtle gradient base */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-200 opacity-90" />

                    {/* Holographic Mesh Gradient - Reduced Opacity */}
                    <div
                        className="absolute -inset-full bg-gradient-to-r from-indigo-100 via-purple-100 to-amber-100 blur-3xl opacity-20 transition-transform duration-700"
                        style={{
                            transform: `translate(${rotate.y * 1}%, ${rotate.x * 1}%) scale(1.2)`
                        }}
                    />

                    {/* Content Layout - Fixed Alignment */}
                    <div className="relative h-full px-8 py-7 flex flex-col z-10">

                        {/* Header: Brand Left, Count Right */}
                        <div className="flex justify-between items-start mb-auto">
                            <div>
                                <h3 className="font-bold text-xl text-gray-900 tracking-tight">Cafe Aroma</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Premium Member</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="text-2xl font-bold text-gray-800 flex items-baseline gap-1">
                                    5 <span className="text-sm font-medium text-gray-400">/ 8</span>
                                </div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stamps</span>
                            </div>
                        </div>

                        {/* Middle: Stamps Rows (Flex justify-between for perfect alignment) */}
                        <div className="flex-1 flex flex-col justify-center gap-6 w-full my-6">
                            {/* Row 1 */}
                            <div className="flex justify-between w-full">
                                {[...Array(4)].map((_, i) => (
                                    <Stamp key={i} index={i} />
                                ))}
                            </div>
                            {/* Row 2 */}
                            <div className="flex justify-between w-full">
                                {[...Array(4)].map((_, i) => (
                                    <Stamp key={i + 4} index={i + 4} />
                                ))}
                            </div>
                        </div>

                        {/* Footer: Minimal text or empty to let stamps breathe */}
                        <div className="flex justify-center mt-auto">
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest opacity-60">Universal Loyalty</p>
                        </div>

                    </div>
                </div>

                {/* Glare Effect / Sheen - Much subtler */}
                <div
                    className="absolute inset-0 rounded-[2rem] pointer-events-none z-20 mix-blend-soft-light"
                    style={{
                        background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 60%)`,
                        opacity: glare.opacity * 0.5, // Reduced max opacity
                        transition: 'opacity 0.5s ease',
                    }}
                />

                {/* Border Highlight that moves slightly */}
                <div
                    className="absolute inset-0 rounded-[2rem] pointer-events-none z-30"
                    style={{
                        boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.5)`
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
          w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-500
          ${isFilled
                        ? "bg-gradient-to-t from-gray-900 to-gray-800 shadow-lg shadow-black/20 scale-100 border border-white/10"
                        : "bg-black/5 inner-shadow border border-black/5"
                    }
        `}
            >
                {isFilled && (
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                )}
            </div>
        </div>
    );
}
