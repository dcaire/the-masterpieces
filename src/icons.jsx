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

// Brand crest — "a framed masterpiece, sung in four voices."
// A gilded gallery frame over a deep-plum tile, a treble clef, and the four
// quartet voices (Soprano · Alto · Tenor · Bass) as a colored chord.
export const Logo = ({ size = 38 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect width="48" height="48" rx="13" fill="url(#gPlum)" />
    {/* gilded gallery frame */}
    <rect x="6" y="6" width="36" height="36" rx="9.5" fill="none" stroke="url(#gFrame)" strokeWidth="2.2" />
    <rect x="9.5" y="9.5" width="29" height="29" rx="6.5" fill="none" stroke="#F6E3A6" strokeWidth="1" opacity=".45" />
    {/* treble clef, shifted left to leave room for the chord */}
    <g transform="translate(-5.4 0) scale(.9)" fill="#FBF3DC">
      <path d="M27.5 12c-2.6.9-4.1 3.2-4.1 6 0 2 .7 3.4 2.4 5.5l.7.9-.5 3.1c-1-.5-1.9-.7-2.9-.7-3 0-5.1 2-5.1 4.8 0 2.7 2 4.6 4.8 4.6 2.9 0 5-2 5-5.1 0-.6 0-.9-.3-2.5l-.3-1.7c2.3.8 3.6 2.3 3.6 4.2 0 .8-.2 1.4-.8 2.2-.2.3-.2.3-.1.4.3.2 1.6-1 2-1.9.3-.6.4-1.1.4-1.9 0-2.6-1.8-4.6-4.8-5.4l-.5-.1.3-2c1.9-2 2.6-3.6 2.6-5.7 0-2.3-.9-3.9-2.4-4.5-.4-.1-.5-.1-.6 0Zm.8 2c.5.6.7 1.4.7 2.5 0 1.6-.5 2.8-1.8 4.3l-.4.4-.2-1.1c-.4-2.1-.2-4 .6-5.3.5-.8.9-1 1.3-.8Zm-5 14.6c.4.1.8.2 1.2.4l.3 1.9c.2 1.4.2 1.6.2 2.1 0 1.7-1 2.8-2.5 2.8s-2.6-1.1-2.6-2.7c0-1.8 1.6-3.1 3.4-2.5Z" />
    </g>
    {/* the four voices, as a rising chord with a shared stem */}
    <rect x="32.4" y="15" width="1.5" height="16.5" rx=".75" fill="#F6E3A6" opacity=".8" />
    <circle cx="29.5" cy="30.5" r="2.5" fill="#F472B6" />
    <circle cx="29.5" cy="26" r="2.5" fill="#A78BFA" />
    <circle cx="29.5" cy="21.5" r="2.5" fill="#FBBF24" />
    <circle cx="29.5" cy="17" r="2.5" fill="#22D3EE" />
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
export const Copy = (p) => <I {...p}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></I>;
export const Send = (p) => <I {...p}><path d="M22 2 11 13M22 2l-7 20-4-9-9-4Z" /></I>;
export const Bell = (p) => <I {...p}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9" /><path d="M10.5 21a1.8 1.8 0 0 0 3 0" /></I>;
export const MapPin = (p) => <I {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="2.8" /></I>;
export const Arrow = (p) => <I {...p}><path d="M5 12h14M13 6l6 6-6 6" /></I>;
export const Search = (p) => <I {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4-4" /></I>;
export const Wave = (p) => <I {...p}><path d="M2 12c2 0 2-5 4-5s2 10 4 10 2-13 4-13 2 8 4 8 2-3 4-3" /></I>;
export const Dollar = (p) => <I {...p}><path d="M12 2v20M17 6.5C17 4.6 14.8 3.5 12 3.5S7 4.8 7 7s2.2 3 5 3.5 5 1.4 5 3.5-2.2 3.5-5 3.5-5-1.1-5-3" /></I>;
export const Pencil = (p) => <I {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></I>;
