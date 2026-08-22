import React from 'react';

export const InstantPingLogo = ({ className = 'w-10 h-10', showPingWaves = true }) => {
  return (
    <svg
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="ipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#9333ea" />
        </linearGradient>
        <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>

      {/* App Squircle Background */}
      <rect width="128" height="128" rx="36" fill="url(#ipGrad)" />
      <rect
        width="124"
        height="124"
        x="2"
        y="2"
        rx="34"
        stroke="rgba(255, 255, 255, 0.22)"
        strokeWidth="2.5"
      />

      {/* Outer Ping Wave */}
      {showPingWaves && (
        <path
          d="M80 28 C100 35, 110 54, 105 76"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="5.5"
          strokeLinecap="round"
          fill="none"
        />
      )}

      {/* Middle Ping Wave */}
      {showPingWaves && (
        <path
          d="M72 38 C86 44, 92 57, 88 72"
          stroke="rgba(255, 255, 255, 0.7)"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
      )}

      {/* Main Message Bubble */}
      <path
        d="M32 36 C32 28.27 38.27 22 46 22 H64 C71.73 22 78 28.27 78 36 V62 C78 69.73 71.73 76 64 76 H48 L32 88 V36 Z"
        fill="white"
      />

      {/* Lightning Instant Ping Bolt inside bubble */}
      <path
        d="M58 31 L44 52 H55 L52 68 L67 45 H56 L58 31 Z"
        fill="url(#boltGrad)"
        stroke="#4f46e5"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Active Status Ping Indicator */}
      <circle
        cx="96"
        cy="96"
        r="9.5"
        fill="#10b981"
        stroke="#0c101a"
        strokeWidth="3.5"
      />
    </svg>
  );
};
