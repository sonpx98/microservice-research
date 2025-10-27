import React from 'react';

interface PlanetIconProps {
  size?: number;
  className?: string;
}

// Earth-like planet with continents
export const EarthPlanet: React.FC<PlanetIconProps> = ({ size = 80, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <radialGradient id="earthGradient" cx="0.3" cy="0.3" r="0.8">
        <stop offset="0%" stopColor="#4ade80" />
        <stop offset="30%" stopColor="#22c55e" />
        <stop offset="70%" stopColor="#16a34a" />
        <stop offset="100%" stopColor="#15803d" />
      </radialGradient>
      <radialGradient id="earthHighlight" cx="0.3" cy="0.3" r="0.6">
        <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </radialGradient>
    </defs>
    {/* Main planet body */}
    <circle cx="40" cy="40" r="38" fill="url(#earthGradient)" />
    {/* Ocean patches */}
    <circle cx="25" cy="30" r="12" fill="#3b82f6" opacity="0.7" />
    <circle cx="55" cy="25" r="8" fill="#3b82f6" opacity="0.7" />
    <circle cx="50" cy="55" r="10" fill="#3b82f6" opacity="0.7" />
    {/* Continent details */}
    <path d="M20 35 Q30 32 35 40 Q32 45 25 42 Q18 40 20 35" fill="#059669" />
    <path d="M50 20 Q60 18 62 28 Q58 32 52 30 Q48 25 50 20" fill="#059669" />
    {/* Highlight */}
    <circle cx="40" cy="40" r="38" fill="url(#earthHighlight)" />
    {/* Atmosphere glow */}
    <circle cx="40" cy="40" r="39" fill="none" stroke="rgba(74, 222, 128, 0.3)" strokeWidth="2" />
  </svg>
);

// Tech planet with circuit patterns
export const TechPlanet: React.FC<PlanetIconProps> = ({ size = 80, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <radialGradient id="techGradient" cx="0.3" cy="0.3" r="0.8">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="30%" stopColor="#3b82f6" />
        <stop offset="70%" stopColor="#2563eb" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </radialGradient>
      <radialGradient id="techHighlight" cx="0.3" cy="0.3" r="0.6">
        <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </radialGradient>
    </defs>
    {/* Main planet body */}
    <circle cx="40" cy="40" r="38" fill="url(#techGradient)" />
    {/* Circuit patterns */}
    <g stroke="#06b6d4" strokeWidth="1.5" fill="none" opacity="0.8">
      <path d="M15 25 L35 25 L35 35 L25 35" />
      <path d="M45 20 L65 20 L65 30 L55 30 L55 40" />
      <path d="M20 50 L30 50 L30 60 L40 60" />
      <path d="M50 55 L60 55 L60 45 L70 45" />
      <circle cx="35" cy="25" r="2" fill="#06b6d4" />
      <circle cx="25" cy="35" r="2" fill="#06b6d4" />
      <circle cx="55" cy="40" r="2" fill="#06b6d4" />
      <circle cx="40" cy="60" r="2" fill="#06b6d4" />
    </g>
    {/* Data nodes */}
    <g fill="#00d4aa" opacity="0.9">
      <circle cx="28" cy="28" r="1.5" />
      <circle cx="52" cy="25" r="1.5" />
      <circle cx="35" cy="50" r="1.5" />
      <circle cx="58" cy="48" r="1.5" />
    </g>
    {/* Highlight */}
    <circle cx="40" cy="40" r="38" fill="url(#techHighlight)" />
  </svg>
);

// Gaming planet with pixel art style
export const GamePlanet: React.FC<PlanetIconProps> = ({ size = 80, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <radialGradient id="gameGradient" cx="0.3" cy="0.3" r="0.8">
        <stop offset="0%" stopColor="#fb7185" />
        <stop offset="30%" stopColor="#f43f5e" />
        <stop offset="70%" stopColor="#e11d48" />
        <stop offset="100%" stopColor="#be123c" />
      </radialGradient>
      <radialGradient id="gameHighlight" cx="0.3" cy="0.3" r="0.6">
        <stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </radialGradient>
    </defs>
    {/* Main planet body */}
    <circle cx="40" cy="40" r="38" fill="url(#gameGradient)" />
    {/* Pixel art patterns */}
    <g fill="#fbbf24" opacity="0.8">
      <rect x="20" y="25" width="4" height="4" />
      <rect x="28" y="25" width="4" height="4" />
      <rect x="24" y="29" width="4" height="4" />
      <rect x="50" y="30" width="4" height="4" />
      <rect x="54" y="34" width="4" height="4" />
      <rect x="58" y="30" width="4" height="4" />
    </g>
    <g fill="#8b5cf6" opacity="0.8">
      <rect x="25" y="45" width="4" height="4" />
      <rect x="29" y="49" width="4" height="4" />
      <rect x="33" y="45" width="4" height="4" />
      <rect x="45" y="50" width="4" height="4" />
      <rect x="49" y="54" width="4" height="4" />
    </g>
    {/* Game controller symbols */}
    <g fill="#10b981" opacity="0.9">
      <circle cx="35" cy="35" r="2" />
      <rect x="52" y="43" width="3" height="6" />
      <rect x="49" y="46" width="9" height="3" />
    </g>
    {/* Highlight */}
    <circle cx="40" cy="40" r="38" fill="url(#gameHighlight)" />
  </svg>
);

// Commerce planet with shopping elements
export const CommercePlanet: React.FC<PlanetIconProps> = ({ size = 80, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <radialGradient id="commerceGradient" cx="0.3" cy="0.3" r="0.8">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="30%" stopColor="#10b981" />
        <stop offset="70%" stopColor="#059669" />
        <stop offset="100%" stopColor="#047857" />
      </radialGradient>
      <radialGradient id="commerceHighlight" cx="0.3" cy="0.3" r="0.6">
        <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </radialGradient>
    </defs>
    {/* Main planet body */}
    <circle cx="40" cy="40" r="38" fill="url(#commerceGradient)" />
    {/* Shopping cart */}
    <g stroke="#fbbf24" strokeWidth="2" fill="none" opacity="0.9">
      <rect x="25" y="30" width="12" height="8" rx="1" />
      <path d="M23 32 L25 30" />
      <path d="M23 30 L20 30" />
      <circle cx="28" cy="42" r="1.5" fill="#fbbf24" />
      <circle cx="34" cy="42" r="1.5" fill="#fbbf24" />
    </g>
    {/* Shopping bag */}
    <g fill="#f59e0b" opacity="0.8">
      <rect x="45" y="35" width="10" height="12" rx="1" />
      <path d="M47 35 Q47 32 50 32 Q53 32 53 35" stroke="#f59e0b" strokeWidth="1.5" fill="none" />
    </g>
    {/* Dollar signs */}
    <g fill="#eab308" opacity="0.9" fontSize="8" fontFamily="monospace" fontWeight="bold">
      <text x="28" y="25" textAnchor="middle">$</text>
      <text x="52" y="25" textAnchor="middle">$</text>
      <text x="25" y="55" textAnchor="middle">$</text>
      <text x="55" y="58" textAnchor="middle">$</text>
    </g>
    {/* Highlight */}
    <circle cx="40" cy="40" r="38" fill="url(#commerceHighlight)" />
  </svg>
);

// Education planet with academic elements
export const EducationPlanet: React.FC<PlanetIconProps> = ({ size = 80, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 80 80"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <radialGradient id="eduGradient" cx="0.3" cy="0.3" r="0.8">
        <stop offset="0%" stopColor="#a78bfa" />
        <stop offset="30%" stopColor="#8b5cf6" />
        <stop offset="70%" stopColor="#7c3aed" />
        <stop offset="100%" stopColor="#6d28d9" />
      </radialGradient>
      <radialGradient id="eduHighlight" cx="0.3" cy="0.3" r="0.6">
        <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </radialGradient>
    </defs>
    {/* Main planet body */}
    <circle cx="40" cy="40" r="38" fill="url(#eduGradient)" />
    {/* Book */}
    <g fill="#fbbf24" opacity="0.9">
      <rect x="30" y="25" width="20" height="15" rx="1" />
      <rect x="32" y="27" width="16" height="1" />
      <rect x="32" y="30" width="16" height="1" />
      <rect x="32" y="33" width="16" height="1" />
      <rect x="32" y="36" width="10" height="1" />
    </g>
    {/* Graduation cap */}
    <g fill="#f59e0b" opacity="0.8">
      <rect x="22" y="45" width="16" height="8" rx="1" />
      <polygon points="20,45 40,42 40,48 20,51" />
      <rect x="38" y="44" width="1" height="6" />
      <circle cx="39" cy="44" r="1" />
    </g>
    {/* Mathematical symbols */}
    <g fill="#06b6d4" opacity="0.9" fontSize="10" fontFamily="serif" fontWeight="bold">
      <text x="52" y="30" textAnchor="middle">π</text>
      <text x="58" y="45" textAnchor="middle">∑</text>
      <text x="25" y="60" textAnchor="middle">∫</text>
      <text x="55" y="60" textAnchor="middle">√</text>
    </g>
    {/* Stars for achievement */}
    <g fill="#fde047" opacity="0.8">
      <polygon points="20,32 21,35 24,35 22,37 23,40 20,38 17,40 18,37 16,35 19,35" />
      <polygon points="58,52 59,54 61,54 60,55 60.5,57 58,56 56,57 56.5,55 55,54 57,54" />
    </g>
    {/* Highlight */}
    <circle cx="40" cy="40" r="38" fill="url(#eduHighlight)" />
  </svg>
);

// Planet component mapping
export const PlanetComponents = {
  earth: EarthPlanet,
  tech: TechPlanet,
  game: GamePlanet,
  commerce: CommercePlanet,
  education: EducationPlanet,
} as const;

export type PlanetType = keyof typeof PlanetComponents;