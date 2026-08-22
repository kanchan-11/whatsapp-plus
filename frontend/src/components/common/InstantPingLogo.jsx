import React from 'react';

export const InstantPingLogo = ({ className = 'w-10 h-10' }) => {
  return (
    <svg
      viewBox="0 0 128 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Rich Brand Gradient */}
        <linearGradient id="ipBgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>

        {/* Bolt Gradient */}
        <linearGradient id="ipBoltGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>

        {/* Squircle Soft Glow Filter following exact rounded shape */}
        <filter id="squircleShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#6366f1" floodOpacity="0.35" />
        </filter>

        {/* Soft Inner Shadow Filter for chat bubble */}
        <filter id="subtleGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.2" />
        </filter>
      </defs>

      {/* Pristine Squircle Badge with smooth radius and curved glow */}
      <rect
        x="6"
        y="6"
        width="116"
        height="116"
        rx="28"
        ry="28"
        fill="url(#ipBgGradient)"
        filter="url(#squircleShadow)"
      />

      {/* Subtle Inner Bevel Highlight */}
      <rect
        x="7.5"
        y="7.5"
        width="113"
        height="113"
        rx="26.5"
        ry="26.5"
        stroke="rgba(255, 255, 255, 0.25)"
        strokeWidth="2"
        fill="none"
      />

      {/* Outer Signal Ping Wave */}
      <path
        d="M78 28 C96 34, 105 50, 100 70"
        stroke="rgba(255, 255, 255, 0.45)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Inner Signal Ping Wave */}
      <path
        d="M72 38 C84 43, 89 54, 86 67"
        stroke="rgba(255, 255, 255, 0.75)"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Centered Chat Bubble with clean curved pointer */}
      <path
        d="M34 36 C34 28.5 40 22.5 47.5 22.5 H65.5 C73 22.5 79 28.5 79 36 V60 C79 67.5 73 73.5 65.5 73.5 H50 L37 84 C35.2 85.4 34 84.4 34 82.5 V36 Z"
        fill="#FFFFFF"
        filter="url(#subtleGlow)"
      />

      {/* Electric Instant Bolt */}
      <path
        d="M58.5 32 L45 52 H55.5 L52.5 67 L67.5 45.5 H56.5 L58.5 32 Z"
        fill="url(#ipBoltGradient)"
        stroke="#4f46e5"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Emerald Live Ping Status Dot */}
      <circle
        cx="92"
        cy="92"
        r="8.5"
        fill="#10b981"
        stroke="#0c101a"
        strokeWidth="3.5"
      />
    </svg>
  );
};
