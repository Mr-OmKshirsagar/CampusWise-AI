import React from 'react';

/**
 * Apple iOS 18 3D Liquid Glass Inflated Bubble Hero Title Component
 * Features:
 * - Volumetric convex lighting + multi-stage 3D extrusion bevels
 * - Translucent frosted ice glass letterforms with specular reflection sheen
 * - Floating glass micro-bubbles with organic physics
 */
export default function LiquidGlassBubbleHeroTitle() {
  return (
    <div className="relative inline-block select-none text-center max-w-5xl mx-auto py-2">
      {/* Floating Ambient Glass Micro-Bubbles */}
      <div className="liquid-glass-bubble w-6 h-6 -top-4 -left-6 sm:-left-10 animate-bubble-1 opacity-75" />
      <div className="liquid-glass-bubble w-4 h-4 top-2 -right-4 sm:-right-8 animate-bubble-2 opacity-80" />
      <div className="liquid-glass-bubble w-8 h-8 -bottom-6 left-1/4 animate-bubble-3 opacity-60" />
      <div className="liquid-glass-bubble w-5 h-5 -bottom-3 right-1/4 animate-bubble-4 opacity-70" />

      <h1 className="font-bubble text-3xl xs:text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.12] sm:leading-[1.08] relative z-10 transition-all duration-300">
        <span className="bubble-pop-text-ice drop-shadow-2xl">
          Official Campus Answers
        </span>
        <span className="glass-bubble-dot mx-1 animate-pulse" />
        <span className="block sm:inline bg-gradient-to-r from-sky-400 via-electric-400 to-indigo-500 bg-clip-text text-transparent sm:ml-3 drop-shadow-[0_10px_25px_rgba(56,189,248,0.45)]">
          Zero Hallucinations
        </span>
        <span className="glass-bubble-dot ml-1" />
      </h1>
    </div>
  );
}
