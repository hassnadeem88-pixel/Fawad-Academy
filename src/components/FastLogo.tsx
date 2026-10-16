import React from 'react';

interface FastLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const FastLogo: React.FC<FastLogoProps> = ({
  className = '',
  size = 48,
  showText = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        className="shrink-0 drop-shadow-lg"
      >
        <defs>
          {/* Rich Academy Gold Gradient */}
          <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="25%" stopColor="#F5BA31" />
            <stop offset="70%" stopColor="#D99B16" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>

          {/* Deep Academic Slate Gradient */}
          <linearGradient id="slateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="60%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#0B111E" />
          </linearGradient>

          {/* Book Gold Wings */}
          <linearGradient id="bookGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBD561" />
            <stop offset="50%" stopColor="#F5BA31" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Book Royal Cobalt Blue Wings */}
          <linearGradient id="bookBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="60%" stopColor="#1D4ED8" />
            <stop offset="100%" stopColor="#1E3A8A" />
          </linearGradient>

          {/* Curved path for circular upper text */}
          <path
            id="textPathUpper"
            d="M 30 100 A 70 70 0 0 1 170 100"
            fill="none"
          />
        </defs>

        {/* Outer Heavy Gold Ring */}
        <circle cx="100" cy="100" r="97" fill="url(#goldRing)" />
        <circle cx="100" cy="100" r="88" fill="#475569" stroke="#F5BA31" strokeWidth="1" />

        {/* Dark Charcoal Ring with Gold Pinstripe */}
        <circle cx="100" cy="100" r="84" fill="url(#slateGrad)" stroke="#F5BA31" strokeWidth="2" />

        {/* Circular upper text: FAWAD ACADEMY SAMARO TOWN */}
        <text
          fill="#FFFFFF"
          fontSize="11.5"
          fontWeight="900"
          letterSpacing="2.8"
          fontFamily="system-ui, -apple-system, sans-serif"
          className="drop-shadow-sm"
        >
          <textPath href="#textPathUpper" xlinkHref="#textPathUpper" startOffset="50%" textAnchor="middle">
            FAWAD ACADEMY SAMARO TOWN
          </textPath>
        </text>

        {/* Inner White Academic Center Disc with Gold Border */}
        <circle cx="100" cy="100" r="50" fill="#FFFFFF" stroke="#D99B16" strokeWidth="2.5" />
        <circle cx="100" cy="100" r="46.5" fill="none" stroke="#F5BA31" strokeWidth="1" strokeDasharray="2,2" opacity="0.6" />

        {/* Central Emblem: Mortarboard & Open Book */}
        <g transform="translate(100, 102)">
          {/* Graduation Mortarboard */}
          <path d="M 0 -27 L 18 -18 L 0 -9 L -18 -18 Z" fill="#D99B16" />
          <path d="M -10 -15 L 0 -10 L 10 -15 L 10 -8 C 10 -4, -10 -4, -10 -8 Z" fill="#1E3A8A" />
          <circle cx="0" cy="-27" r="2.5" fill="#1E3A8A" />
          <path d="M 10 -18 L 15 -11 L 15 -4" stroke="#F5BA31" strokeWidth="1.8" fill="none" strokeLinecap="round" />

          {/* Book Open Wings - Outer Layer (Gold) */}
          <path
            d="M 0 10 C 14 0, 30 2, 34 -4 C 34 8, 16 12, 0 18 C -16 12, -34 8, -34 -4 C -30 2, -14 0, 0 10 Z"
            fill="url(#bookGold)"
          />
          {/* Inner Wing Pages (White & Blue Lines) */}
          <path
            d="M 0 6 C 12 -4, 26 -2, 30 -8 C 28 2, 14 5, 0 13 C -14 5, -28 2, -30 -8 C -26 -2, -12 -4, 0 6 Z"
            fill="#FFFFFF"
            stroke="#1D4ED8"
            strokeWidth="1.2"
          />
          {/* Inner Royal Blue Wings */}
          <path
            d="M 0 0 C 10 -9, 22 -7, 26 -12 C 24 -3, 12 1, 0 8 C -12 1, -24 -3, -26 -12 C -22 -7, -10 -9, 0 0 Z"
            fill="url(#bookBlue)"
          />
          {/* Central Golden Spine */}
          <line x1="0" y1="-8" x2="0" y2="18" stroke="#D99B16" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* Lower Arc: Left Star, FAST, Right Star */}
        <g>
          {/* Left Star */}
          <polygon
            points="54,142 57,149 65,150 59,155 61,163 54,159 47,163 49,155 43,150 51,149"
            fill="#F5BA31"
            stroke="#FFFFFF"
            strokeWidth="0.5"
          />
          {/* FAST Acronym in Bold Gold & White */}
          <text
            x="100"
            y="157"
            fill="#FFFFFF"
            fontSize="15"
            fontWeight="900"
            letterSpacing="5"
            textAnchor="middle"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            FAST
          </text>
          {/* Right Star */}
          <polygon
            points="146,142 149,149 157,150 151,155 153,163 146,159 139,163 141,155 135,150 143,149"
            fill="#F5BA31"
            stroke="#FFFFFF"
            strokeWidth="0.5"
          />
        </g>
      </svg>

      {showText && (
        <div className="flex flex-col text-left">
          <span className="font-black text-base tracking-tight text-white flex items-center gap-2 leading-snug">
            Fawad Academy
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F5BA31] text-[#0B111E] shadow-sm">
              FAST
            </span>
          </span>
          <span className="text-xs text-[#F5BA31] font-bold tracking-wide">
            Samaro Town
          </span>
        </div>
      )}
    </div>
  );
};
