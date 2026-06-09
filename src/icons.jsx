// Custom SVG graphics for The Masterpieces — modern, vibrant iconography.
// All icons inherit color via `currentColor` unless a gradient id is referenced.

export const Defs = () => (
  <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
    <defs>
      <linearGradient id="gPurple" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#7C3AED" /><stop offset="1" stopColor="#EC4899" />
      </linearGradient>
      <linearGradient id="gTeal" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#06B6D4" /><stop offset="1" stopColor="#3B82F6" />
      </linearGradient>
      <linearGradient id="gAmber" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#F59E0B" /><stop offset="1" stopColor="#FB7185" />
      </linearGradient>
      <linearGradient id="gGreen" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#10B981" /><stop offset="1" stopColor="#06B6D4" />
      </linearGradient>
      <linearGradient id="gGold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FDE68A" /><stop offset="1" stopColor="#F59E0B" />
      </linearGradient>
      <linearGradient id="gPlum" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#4C1D95" /><stop offset="1" stopColor="#7C3AED" />
      </linearGradient>
      <linearGradient id="gFrame" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FCE8B6" /><stop offset=".5" stopColor="#E3B341" /><stop offset="1" stopColor="#B8860B" />
      </linearGradient>
    </defs>
  </svg>
);

// Brand mark — navy tile, a five-line staff, a gold treble clef, and the
// signature five-bar stripe (gold·copper·rose·teal·iris) along the base.
export const Logo = ({ size = 38 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="13" fill="#1a1a1a" />
    {/* staff lines */}
    {[15, 19.5, 24, 28.5, 33].map(y => <line key={y} x1="8" y1={y} x2="40" y2={y} stroke="#c8102e" strokeWidth="0.6" opacity="0.26" />)}
    {/* treble clef (brand path) */}
    <g transform="translate(13.5 6.5) scale(0.5)">
      <path d="M 18 58 C 14 54 8 46 8 38 C 8 30 12 26 18 24 L 18 24 C 18 18 18 10 20 6 C 22 2 26 0 28 2 C 30 4 28 8 26 12 C 24 16 20 22 18 28 L 18 28 C 24 28 30 32 30 40 C 30 48 24 52 18 52 C 14 52 12 48 12 44 C 12 40 14 38 18 38 C 22 38 24 40 24 44 C 24 46 22 48 20 48" fill="none" stroke="#c8102e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    {/* five-bar stripe */}
    <rect x="8" y="39" width="6.4" height="3" fill="#c8102e" />
    <rect x="14.4" y="39" width="6.4" height="3" fill="#e07830" />
    <rect x="20.8" y="39" width="6.4" height="3" fill="#d03a6a" />
    <rect x="27.2" y="39" width="6.4" height="3" fill="#20a89a" />
    <rect x="33.6" y="39" width="6.4" height="3" fill="#7b52c4" />
  </svg>
);

const I = ({ size = 20, stroke = 2, children, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" {...p}>{children}</svg>
);

export const Note = (p) => <I {...p}><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /><path d="M9 18V5l12-2v13" /><path d="M9 9l12-2" /></I>;
export const Mail = (p) => <I {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></I>;
export const Cloud = (p) => <I {...p}><path d="M17.5 19a4.5 4.5 0 0 0 .5-9 6 6 0 0 0-11.6 1.5A3.5 3.5 0 0 0 7 19Z" /></I>;
export const Tablet = (p) => <I {...p}><rect x="5" y="2" width="14" height="20" rx="2.5" /><path d="M11 18h2" /></I>;
export const Calendar = (p) => <I {...p}><rect x="3" y="4" width="18" height="18" rx="2.5" /><path d="M3 9h18M8 2v4M16 2v4" /></I>;
export const Users = (p) => <I {...p}><circle cx="9" cy="8" r="3.2" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16.5 5.3a3.2 3.2 0 0 1 0 5.4M21 20a6 6 0 0 0-4.5-5.8" /></I>;
export const Sparkle = (p) => <I {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4" /><path d="M12 8.5 13.2 11l2.5 1-2.5 1L12 15.5 10.8 13l-2.5-1 2.5-1Z" fill="currentColor" stroke="none" /></I>;
export const Phone = (p) => <I {...p}><path d="M5 3h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z" /></I>;
export const Check = (p) => <I {...p}><path d="m20 6-11 11-5-5" /></I>;
export const Clock = (p) => <I {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></I>;
export const Plus = (p) => <I {...p}><path d="M12 5v14M5 12h14" /></I>;
export const Trash = (p) => <I {...p}><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" /></I>;
export const Copy = (p) => <I {...p}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></I>;
export const Send = (p) => <I {...p}><path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z" /></I>;
export const Bell = (p) => <I {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9" /><path d="M10.5 21a1.8 1.8 0 0 0 3 0" /></I>;
export const MapPin = (p) => <I {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="2.8" /></I>;
export const Arrow = (p) => <I {...p}><path d="M5 12h14M13 6l6 6-6 6" /></I>;
export const Search = (p) => <I {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" /></I>;
export const Wave = (p) => <I {...p}><path d="M2 12c2 0 2-5 4-5s2 10 4 10 2-13 4-13 2 8 4 8 2-3 4-3" /></I>;
export const Dollar = (p) => <I {...p}><path d="M12 2v20M17 6.5C17 4.6 14.8 3.5 12 3.5S7 4.8 7 7s2.2 3 5 3.5 5 1.4 5 3.5-2.2 3.5-5 3.5-5-1.1-5-3" /></I>;
export const Pencil = (p) => <I {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></I>;
export const Target = (p) => <I {...p}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /></I>;
export const Globe = (p) => <I {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.8 5.7 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3Z" /></I>;
