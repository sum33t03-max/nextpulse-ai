'use client';

import React from 'react';

interface NextPulseLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export const NextPulseLogo: React.FC<NextPulseLogoProps> = ({
  className = "w-8 h-8",
  size = 32,
  glow = true,
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {glow && (
        <div
          className="absolute inset-0 rounded-full bg-cyan-500/20 blur-md animate-pulse"
          style={{ transform: 'scale(1.2)' }}
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 overflow-visible"
      >
        <defs>
          <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="50%" stopColor="#8A2BE2" />
            <stop offset="100%" stopColor="#00FF66" />
          </linearGradient>
          <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Neural Frequency Wave forming 'N' */}
        <path
          d="M 10 38 L 10 12 L 20 28 L 28 20 L 38 36 L 38 10"
          stroke="url(#pulseGrad)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glowFilter)"
        />

        {/* Central Pulse Glowing Node */}
        <circle cx="24" cy="24" r="3.5" fill="#00F0FF" className="animate-ping opacity-75" />
        <circle cx="24" cy="24" r="2.5" fill="#FFFFFF" />
      </svg>
    </div>
  );
};
