import React from 'react';
import './LogoVector.css';

export default function LogoVector({ className = '' }) {
  return (
    <div className={`trc-logo-vector ${className}`}>
      <svg
        viewBox="0 0 680 420"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="trc-logo-svg"
        role="img"
        aria-label="The Rides Club Logo"
      >
        <defs>
          {/* Yellow bubble gradient — warm top highlight to deep gold bottom */}
          <linearGradient id="lg-yellow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFE566" />
            <stop offset="45%" stopColor="#FEC60F" />
            <stop offset="100%" stopColor="#E5A800" />
          </linearGradient>

          {/* Blue border gradient */}
          <linearGradient id="lg-blue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4158FF" />
            <stop offset="100%" stopColor="#2034C7" />
          </linearGradient>

          {/* Red tag face gradient */}
          <linearGradient id="lg-red-face" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EE5249" />
            <stop offset="100%" stopColor="#D04D44" />
          </linearGradient>

          {/* Red tag side (darker) */}
          <linearGradient id="lg-red-side" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#A83028" />
            <stop offset="100%" stopColor="#7E1C15" />
          </linearGradient>

          {/* Deep blue for the 3D extrusion shadow */}
          <linearGradient id="lg-deep-blue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16228A" />
            <stop offset="100%" stopColor="#0E1660" />
          </linearGradient>

          {/* Gloss overlay gradient for letters */}
          <linearGradient id="lg-gloss" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Clip for gloss overlay — top half only */}
          <clipPath id="gloss-clip">
            <rect x="0" y="100" width="680" height="110" />
          </clipPath>
        </defs>

        {/* =============================================================
            LAYER 1 — WHITE STICKER OUTLINE (halo behind everything)
            ============================================================= */}
        <g
          fontFamily="'Outfit', -apple-system, sans-serif"
          fontWeight="900"
          textAnchor="middle"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          {/* White halo for RIDES */}
          <g stroke="#FFFFFF" strokeWidth="56" fill="#FFFFFF">
            <text x="340" y="268" fontSize="195" letterSpacing="-4">
              RIDES
            </text>
          </g>
        </g>

        {/* =============================================================
            LAYER 2 — 3D EXTRUSION (deep blue offset behind the letters)
            ============================================================= */}
        <g
          fontFamily="'Outfit', -apple-system, sans-serif"
          fontWeight="900"
          textAnchor="middle"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          <g stroke="url(#lg-deep-blue)" strokeWidth="40" fill="url(#lg-deep-blue)">
            <text x="340" y="278" fontSize="195" letterSpacing="-4">
              RIDES
            </text>
          </g>
        </g>

        {/* =============================================================
            LAYER 3 — BLUE BORDER (vibrant blue outline sitting on extrusion)
            ============================================================= */}
        <g
          fontFamily="'Outfit', -apple-system, sans-serif"
          fontWeight="900"
          textAnchor="middle"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          <g stroke="url(#lg-blue)" strokeWidth="30" fill="url(#lg-blue)">
            <text x="340" y="268" fontSize="195" letterSpacing="-4">
              RIDES
            </text>
          </g>
        </g>

        {/* =============================================================
            LAYER 4 — YELLOW BUBBLE FILL (the main candy-colored surface)
            ============================================================= */}
        <g
          fontFamily="'Outfit', -apple-system, sans-serif"
          fontWeight="900"
          textAnchor="middle"
        >
          <text
            x="340"
            y="268"
            fontSize="195"
            letterSpacing="-4"
            fill="url(#lg-yellow)"
          >
            RIDES
          </text>
        </g>

        {/* =============================================================
            LAYER 5 — GLOSS HIGHLIGHTS (specular shine on each letter)
            ============================================================= */}
        <g clipPath="url(#gloss-clip)">
          <g
            fontFamily="'Outfit', -apple-system, sans-serif"
            fontWeight="900"
            textAnchor="middle"
          >
            <text
              x="340"
              y="268"
              fontSize="195"
              letterSpacing="-4"
              fill="url(#lg-gloss)"
            >
              RIDES
            </text>
          </g>
        </g>

        {/* Small crisp shine arcs on each letter */}
        <g
          fill="none"
          stroke="#FFF9D4"
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.7"
        >
          {/* R shine */}
          <path d="M 128 155 Q 152 138 178 142" />
          <circle cx="132" cy="200" r="3.5" fill="#FFF9D4" stroke="none" />
          {/* I shine */}
          <ellipse cx="262" cy="150" rx="9" ry="4.5" fill="#FFF9D4" stroke="none" />
          {/* D shine */}
          <path d="M 310 152 Q 340 138 368 155" />
          {/* E shine */}
          <path d="M 415 148 Q 442 135 466 150" />
          {/* S shine */}
          <path d="M 510 152 Q 538 140 562 156" />
          <path d="M 502 228 Q 530 218 555 235" />
        </g>

        {/* =============================================================
            "THE" — SMALL BLUE PILL BADGE (sits above "RIDES")
            ============================================================= */}
        <g className="trc-the-pill">
          {/* Pill background */}
          <rect
            x="271"
            y="58"
            width="138"
            height="52"
            rx="26"
            fill="url(#lg-blue)"
            stroke="#16228A"
            strokeWidth="4"
          />
          {/* Pill top edge highlight */}
          <rect
            x="285"
            y="62"
            width="110"
            height="4"
            rx="2"
            fill="#7B8FFF"
            opacity="0.6"
          />
          {/* THE text */}
          <text
            x="340"
            y="87"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="'Outfit', sans-serif"
            fontWeight="900"
            fontSize="30"
            fill="#FFFFFF"
            letterSpacing="5"
          >
            THE
          </text>
        </g>

        {/* =============================================================
            "CLUB" — 3D EXTRUDED RED TAG (sits below "RIDES")
            ============================================================= */}
        <g className="trc-club-tag">
          {/* 3D side face (dark red depth) */}
          <path
            d="M 222,302 L 222,352 Q 222,362 232,362 L 448,362 Q 458,362 458,352 L 458,302 L 468,295 L 468,345 Q 468,358 455,358 L 225,358 Q 212,358 212,345 L 212,295 Z"
            fill="url(#lg-red-side)"
          />
          {/* Bottom rim */}
          <line
            x1="215"
            y1="360"
            x2="465"
            y2="360"
            stroke="#54120D"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Front face */}
          <rect
            x="222"
            y="295"
            width="236"
            height="58"
            rx="14"
            fill="url(#lg-red-face)"
            stroke="#8B2920"
            strokeWidth="3"
          />
          {/* Front face top highlight */}
          <rect
            x="232"
            y="298"
            width="216"
            height="4"
            rx="2"
            fill="#FFA8A0"
            opacity="0.7"
          />
          {/* CLUB text */}
          <text
            x="340"
            y="328"
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="'Outfit', sans-serif"
            fontWeight="900"
            fontSize="38"
            fill="#FFFFFF"
            letterSpacing="8"
          >
            CLUB
          </text>
        </g>

        {/* =============================================================
            DECORATIVE STICKER DOTS (playful accents)
            ============================================================= */}
        <g className="trc-sticker-dots">
          {/* Top-left dot */}
          <circle
            cx="92"
            cy="115"
            r="10"
            fill="#D04D44"
            stroke="#FFFFFF"
            strokeWidth="3"
          />
          {/* Top-right dot */}
          <circle
            cx="588"
            cy="95"
            r="8"
            fill="#3043E4"
            stroke="#FFFFFF"
            strokeWidth="3"
          />
          {/* Bottom-left dot */}
          <circle
            cx="118"
            cy="330"
            r="7"
            fill="#3043E4"
            stroke="#FFFFFF"
            strokeWidth="2.5"
          />
          {/* Bottom-right dot */}
          <circle
            cx="570"
            cy="345"
            r="9"
            fill="#D04D44"
            stroke="#FFFFFF"
            strokeWidth="3"
          />
        </g>

        {/* Small star/sparkle accents */}
        <g fill="#FFFFFF" opacity="0.85">
          <g transform="translate(108, 190) rotate(15)">
            <rect x="-2" y="-8" width="4" height="16" rx="2" />
            <rect x="-8" y="-2" width="16" height="4" rx="2" />
          </g>
          <g transform="translate(572, 180) rotate(-10)">
            <rect x="-1.5" y="-6" width="3" height="12" rx="1.5" />
            <rect x="-6" y="-1.5" width="12" height="3" rx="1.5" />
          </g>
          <g transform="translate(620, 260) rotate(22)">
            <rect x="-1.5" y="-5" width="3" height="10" rx="1.5" />
            <rect x="-5" y="-1.5" width="10" height="3" rx="1.5" />
          </g>
        </g>
      </svg>
    </div>
  );
}
