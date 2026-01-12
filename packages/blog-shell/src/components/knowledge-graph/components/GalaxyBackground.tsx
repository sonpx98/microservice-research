'use client';

import React from 'react';

interface GalaxyBackgroundProps {
  isMounted: boolean;
}

// Generate random stars for background
const backgroundStars = Array.from({ length: 200 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 0.5,
  opacity: Math.random() * 0.7 + 0.3,
  delay: Math.random() * 3,
}));

export function GalaxyBackground({ isMounted }: GalaxyBackgroundProps) {
  return (
    <>
      <div className="absolute inset-0 pointer-events-none">
        {/* Nebula clouds */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 20% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 70%, rgba(59, 130, 246, 0.12) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 50%, rgba(168, 85, 247, 0.08) 0%, transparent 60%)
            `,
          }}
        />
        
        {/* Animated stars - Only render on client to avoid hydration mismatch */}
        {isMounted && (
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            {backgroundStars.map((star) => (
              <circle
                key={star.id}
                cx={`${star.x}%`}
                cy={`${star.y}%`}
                r={star.size}
                fill="white"
                opacity={star.opacity}
                filter="url(#glow)"
                style={{
                  animation: `twinkle ${2 + star.delay}s ease-in-out infinite`,
                  animationDelay: `${star.delay}s`,
                }}
              />
            ))}
          </svg>
        )}
        
        {/* Milky Way effect */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              linear-gradient(135deg, 
                transparent 0%,
                rgba(139, 92, 246, 0.2) 25%,
                rgba(59, 130, 246, 0.3) 50%,
                rgba(139, 92, 246, 0.2) 75%,
                transparent 100%
              )
            `,
            transform: 'rotate(-20deg) scale(1.5)',
          }}
        />
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  );
}
