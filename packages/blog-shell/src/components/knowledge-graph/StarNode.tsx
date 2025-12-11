import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface StarNodeData {
  label: string;
  type: string;
}

const typeColors = {
  technical: {
    primary: '#3b82f6',
    light: '#60a5fa',
    glow: 'rgba(59, 130, 246, 0.6)',
  },
  issue: {
    primary: '#ef4444',
    light: '#f87171',
    glow: 'rgba(239, 68, 68, 0.6)',
  },
  slang: {
    primary: '#a855f7',
    light: '#c084fc',
    glow: 'rgba(168, 85, 247, 0.6)',
  },
};

// Generate star polygon path with multiple points
function generateStarPath(points: number, outerRadius: number, innerRadius: number): string {
  const angle = Math.PI / points;
  let path = '';
  
  for (let i = 0; i < 2 * points; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const currentAngle = i * angle - Math.PI / 2;
    const x = 50 + radius * Math.cos(currentAngle);
    const y = 50 + radius * Math.sin(currentAngle);
    
    if (i === 0) {
      path += `M ${x} ${y}`;
    } else {
      path += ` L ${x} ${y}`;
    }
  }
  
  path += ' Z';
  return path;
}

export const StarNode = memo(({ data, selected }: NodeProps<StarNodeData>) => {
  const colors = typeColors[data.type as keyof typeof typeColors] || typeColors.technical;
  const starPath = generateStarPath(8, 45, 20); // 8-pointed star
  
  return (
    <>
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      
      <div
        style={{
          position: 'relative',
          width: '140px',
          height: '140px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Outer glow effect */}
        <svg
          width="140"
          height="140"
          viewBox="0 0 100 100"
          style={{
            position: 'absolute',
            filter: `drop-shadow(0 0 ${selected ? '25px' : '15px'} ${colors.glow}) 
                     drop-shadow(0 0 ${selected ? '40px' : '20px'} ${colors.glow})`,
            transition: 'filter 0.3s ease',
          }}
        >
          <defs>
            <radialGradient id={`starGradient-${data.type}`} cx="35%" cy="35%">
              <stop offset="0%" stopColor={colors.light} stopOpacity="1" />
              <stop offset="50%" stopColor={colors.primary} stopOpacity="1" />
              <stop offset="100%" stopColor={colors.primary} stopOpacity="0.8" />
            </radialGradient>
            <filter id="innerGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Main star shape */}
          <path
            d={starPath}
            fill={`url(#starGradient-${data.type})`}
            stroke={selected ? colors.light : 'transparent'}
            strokeWidth={selected ? '2' : '0'}
            filter="url(#innerGlow)"
            style={{
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: selected ? 'scale(1.1)' : 'scale(1)',
              transformOrigin: 'center',
            }}
          />
          
          {/* Inner shine effect */}
          <ellipse
            cx="42"
            cy="42"
            rx="15"
            ry="12"
            fill="rgba(255, 255, 255, 0.3)"
            filter="blur(4px)"
            style={{ mixBlendMode: 'overlay' }}
          />
        </svg>
        
        {/* Label container */}
        <div
          style={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '70px',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              color: 'white',
              fontSize: '11px',
              fontWeight: '700',
              textShadow: `
                0 1px 3px rgba(0,0,0,0.8),
                0 0 8px ${colors.primary}
              `,
              lineHeight: '1.2',
              maxWidth: '65px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {data.label}
          </span>
        </div>
        
        {/* Twinkling effect for selected */}
        {selected && (
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              animation: 'twinkle 2s ease-in-out infinite',
              pointerEvents: 'none',
            }}
          >
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  width: '3px',
                  height: '3px',
                  borderRadius: '50%',
                  background: 'white',
                  boxShadow: '0 0 8px white',
                  top: `${[15, 20, 80, 75][i]}%`,
                  left: `${[20, 80, 25, 75][i]}%`,
                  animation: `sparkle ${1 + i * 0.3}s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
      
      <style>{`
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 1;
          }
        }
        
        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }
      `}</style>
    </>
  );
});

StarNode.displayName = 'StarNode';
