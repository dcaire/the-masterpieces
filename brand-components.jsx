/**
 * THE MASTERPIECES — Brand Components
 * Reusable React components for musical SVG elements and brand patterns.
 * Import these into any React web app to apply the brand.
 */

// =============================================
// BRAND COLORS (importable as JS object)
// =============================================

export const brandColors = {
  // Foundation
  navy: "#0d1a30",
  deep: "#152242",
  sapphire: "#1c3564",
  gold: "#e8b430",
  amber: "#f0c850",
  cream: "#fdf8ee",
  parchment: "#f4ede0",

  // Note / Accent
  rose: "#d03a6a",
  copper: "#e07830",
  teal: "#20a89a",
  iris: "#7b52c4",
  coral: "#e05545",
  sky: "#3898d4",
  magenta: "#c035a0",

  // Utility
  ink: "#1a1a2e",
  stone: "#6e6e82",
  lite: "#b0b0c0",
};

// Voice-part color mapping
export const voiceColors = {
  soprano: brandColors.rose,
  alto: brandColors.copper,
  tenor: brandColors.teal,
  bass: brandColors.iris,
};

// Full note color array for decorative use
export const noteColorArray = [
  brandColors.rose,
  brandColors.copper,
  brandColors.teal,
  brandColors.iris,
  brandColors.gold,
  brandColors.coral,
  brandColors.sky,
  brandColors.magenta,
];

// Five-bar color array
export const fiveBarColors = [
  brandColors.gold,
  brandColors.copper,
  brandColors.rose,
  brandColors.teal,
  brandColors.iris,
];


// =============================================
// GOOGLE FONTS LOADER
// =============================================

/**
 * Drop this component once at the top of your app to load brand fonts.
 * Usage: <BrandFonts />
 */
export function BrandFonts() {
  return (
    <link
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Outfit:wght@200;300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
  );
}


// =============================================
// FIVE-BAR STRIPE
// =============================================

/**
 * The primary brand signature element.
 * A horizontal bar divided into 5 equal color segments.
 *
 * Props:
 *   height (number) - px height, default 3
 *   style (object)  - additional container styles
 *
 * Usage: <FiveBar /> or <FiveBar height={4} />
 */
export function FiveBar({ height = 3, style = {} }) {
  return (
    <div style={{ display: "flex", height, ...style }}>
      {fiveBarColors.map((color, i) => (
        <div key={i} style={{ flex: 1, background: color }} />
      ))}
    </div>
  );
}


// =============================================
// TREBLE CLEF
// =============================================

/**
 * SVG treble clef mark.
 *
 * Props:
 *   size (number)    - base scaling factor, default 1
 *   color (string)   - stroke color, default gold
 *   opacity (number) - 0-1, default 1
 *   className        - optional CSS class
 *
 * Usage: <TrebleClef size={0.7} color={brandColors.amber} />
 *
 * For placement inside an SVG <svg>, use <TrebleClefPath> instead.
 */
export function TrebleClef({ size = 1, color = brandColors.gold, opacity = 1, className }) {
  const w = 38 * size;
  const h = 62 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 38 62" className={className} style={{ opacity }}>
      <TrebleClefPath x={0} y={0} size={1} color={color} />
    </svg>
  );
}

/**
 * Raw treble clef path for embedding inside an existing <svg>.
 * Props: x, y, size, color
 */
export function TrebleClefPath({ x = 0, y = 0, size = 1, color = brandColors.gold }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${size})`}>
      <path
        d="M 18 58 C 14 54 8 46 8 38 C 8 30 12 26 18 24 L 18 24 C 18 18 18 10 20 6 C 22 2 26 0 28 2 C 30 4 28 8 26 12 C 24 16 20 22 18 28 L 18 28 C 24 28 30 32 30 40 C 30 48 24 52 18 52 C 14 52 12 48 12 44 C 12 40 14 38 18 38 C 22 38 24 40 24 44 C 24 46 22 48 20 48"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}


// =============================================
// MUSICAL NOTES
// =============================================

/**
 * SVG musical note for embedding inside an <svg>.
 *
 * Props:
 *   x, y (number)   - position on the staff
 *   color (string)   - fill/stroke color
 *   type (string)    - "quarter" | "eighth" | "half"
 *   size (number)    - scale factor, default 1
 *
 * Usage (inside an <svg>):
 *   <Note x={50} y={30} color={brandColors.rose} type="quarter" />
 */
export function Note({ x, y, color, type = "quarter", size = 1 }) {
  const s = size;
  if (type === "quarter") {
    return (
      <g>
        <ellipse cx={x} cy={y} rx={5.5 * s} ry={4 * s} fill={color} transform={`rotate(-18, ${x}, ${y})`} />
        <line x1={x + 4.5 * s} y1={y} x2={x + 4.5 * s} y2={y - 22 * s} stroke={color} strokeWidth={1.3 * s} />
      </g>
    );
  }
  if (type === "eighth") {
    return (
      <g>
        <ellipse cx={x} cy={y} rx={5.5 * s} ry={4 * s} fill={color} transform={`rotate(-18, ${x}, ${y})`} />
        <line x1={x + 4.5 * s} y1={y} x2={x + 4.5 * s} y2={y - 22 * s} stroke={color} strokeWidth={1.3 * s} />
        <path
          d={`M ${x + 4.5 * s} ${y - 22 * s} C ${x + 12 * s} ${y - 18 * s} ${x + 14 * s} ${y - 12 * s} ${x + 10 * s} ${y - 8 * s}`}
          fill="none"
          stroke={color}
          strokeWidth={1.2 * s}
        />
      </g>
    );
  }
  if (type === "half") {
    return (
      <g>
        <ellipse cx={x} cy={y} rx={5.5 * s} ry={4 * s} fill="none" stroke={color} strokeWidth={1.5 * s} transform={`rotate(-18, ${x}, ${y})`} />
        <line x1={x + 4.5 * s} y1={y} x2={x + 4.5 * s} y2={y - 22 * s} stroke={color} strokeWidth={1.3 * s} />
      </g>
    );
  }
  return null;
}


// =============================================
// MUSICAL STAFF
// =============================================

/**
 * Five-line musical staff as an SVG container.
 * Place <Note>, <TrebleClefPath>, and <Fermata> inside as children.
 *
 * Props:
 *   width (number)       - SVG width, default 300
 *   height (number)      - SVG height, default 50
 *   lineColor (string)   - staff line color, default gold
 *   lineOpacity (number) - 0-1, default 0.35
 *   children             - SVG child elements (notes, clef, etc.)
 *   className            - optional CSS class
 *   style                - optional container style
 *
 * Usage:
 *   <MusicalStaff width={300} height={50}>
 *     <TrebleClefPath x={4} y={1} size={0.7} color={brandColors.amber} />
 *     <Note x={70} y={38} color={brandColors.iris} type="quarter" />
 *     <Note x={110} y={22} color={brandColors.rose} type="eighth" />
 *   </MusicalStaff>
 */
export function MusicalStaff({
  width = 300,
  height = 50,
  lineColor = brandColors.gold,
  lineOpacity = 0.35,
  children,
  className,
  style,
}) {
  const gap = height / 6;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className={className} style={style}>
      {[1, 2, 3, 4, 5].map((i) => (
        <line
          key={i}
          x1="0"
          y1={gap * i}
          x2={width}
          y2={gap * i}
          stroke={lineColor}
          strokeWidth="0.6"
          opacity={lineOpacity}
        />
      ))}
      {children}
    </svg>
  );
}


// =============================================
// FERMATA
// =============================================

/**
 * Fermata symbol (hold/sustain) for embedding inside an <svg>.
 *
 * Props:
 *   x, y (number)  - position
 *   size (number)   - scale factor, default 1
 *   color (string)  - stroke/fill color, default gold
 *
 * Usage (inside an <svg>):
 *   <Fermata x={200} y={0} size={0.5} color={brandColors.gold} />
 */
export function Fermata({ x = 0, y = 0, size = 1, color = brandColors.gold }) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${size})`}>
      <path
        d="M 0 20 C 2 6 10 0 18 0 C 26 0 34 6 36 20"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="18" cy="14" r="2.5" fill={color} />
    </g>
  );
}


// =============================================
// COLORED NOTE DOTS ROW
// =============================================

/**
 * A horizontal row of colored dots representing the note palette.
 * Use as a decorative brand signature.
 *
 * Props:
 *   dotSize (number)  - px diameter, default 5
 *   gap (number)      - px gap, default 4
 *   opacity (number)  - 0-1, default 0.6
 *   colors (array)    - override color array
 *
 * Usage: <NoteDots />
 */
export function NoteDots({
  dotSize = 5,
  gap = 4,
  opacity = 0.6,
  colors = noteColorArray,
}) {
  return (
    <div style={{ display: "flex", gap, alignItems: "center" }}>
      {colors.map((color, i) => (
        <div
          key={i}
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: "50%",
            background: color,
            opacity,
          }}
        />
      ))}
    </div>
  );
}


// =============================================
// PREBUILT MUSICAL PHRASE
// =============================================

/**
 * A ready-made musical phrase with treble clef and colored notes on a staff.
 * Drop this anywhere you need the signature musical motif.
 *
 * Props:
 *   width (number)       - total width, default 300
 *   height (number)      - total height, default 50
 *   variant ("dark"|"light") - staff line color adapts
 *   noteSize (number)    - note scale, default 0.85
 *
 * Usage: <MusicalPhrase width={280} variant="dark" />
 */
export function MusicalPhrase({
  width = 300,
  height = 50,
  variant = "dark",
  noteSize = 0.85,
}) {
  const lineColor = variant === "dark" ? brandColors.gold : `${brandColors.navy}22`;
  const clefColor = variant === "dark" ? brandColors.amber : brandColors.navy;

  // Note positions: ascending phrase from bass to soprano and back
  const notes = [
    { x: 0.22, y: 0.76, color: brandColors.iris, type: "quarter" },
    { x: 0.33, y: 0.60, color: brandColors.teal, type: "eighth" },
    { x: 0.44, y: 0.44, color: brandColors.copper, type: "quarter" },
    { x: 0.55, y: 0.28, color: brandColors.rose, type: "eighth" },
    { x: 0.66, y: 0.44, color: brandColors.coral, type: "half" },
    { x: 0.77, y: 0.60, color: brandColors.sky, type: "quarter" },
    { x: 0.88, y: 0.28, color: brandColors.magenta, type: "eighth" },
  ];

  return (
    <MusicalStaff width={width} height={height} lineColor={lineColor}>
      <TrebleClefPath x={4} y={1} size={height / 85} color={clefColor} />
      {notes.map((n, i) => (
        <Note
          key={i}
          x={width * n.x}
          y={height * n.y}
          color={n.color}
          type={n.type}
          size={noteSize * (height / 50)}
        />
      ))}
    </MusicalStaff>
  );
}


// =============================================
// BRAND HEADER
// =============================================

/**
 * Full branded header bar with wordmark, staff, and five-bar stripe.
 *
 * Props:
 *   title (string) - override title, default "The Masterpieces"
 *   subtitle (string) - optional subtitle
 *   showStaff (bool)  - show musical phrase, default true
 *
 * Usage: <BrandHeader subtitle="Vocal Ensemble" />
 */
export function BrandHeader({ title, subtitle, showStaff = true }) {
  return (
    <div
      style={{
        background: brandColors.navy,
        padding: "24px 20px 18px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 35%, ${brandColors.sapphire}44 0%, transparent 65%)`,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative" }}>
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: 10,
            color: brandColors.gold,
            letterSpacing: 6,
            fontWeight: 200,
          }}
        >
          THE
        </span>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 28,
            fontWeight: 700,
            color: brandColors.cream,
            margin: "2px 0 0",
            letterSpacing: 4,
            textTransform: "uppercase",
            lineHeight: 1,
          }}
        >
          {title || "Masterpieces"}
        </h1>

        {showStaff && (
          <div style={{ margin: "10px auto 0", maxWidth: 260 }}>
            <MusicalPhrase width={260} height={36} variant="dark" noteSize={0.65} />
          </div>
        )}

        {subtitle && (
          <div style={{ marginTop: 8 }}>
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 8,
                color: brandColors.amber,
                letterSpacing: 3,
                opacity: 0.5,
              }}
            >
              {subtitle.toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Five-bar at bottom */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
        <FiveBar height={2.5} />
      </div>
    </div>
  );
}


// =============================================
// ENSEMBLE MEMBER LIST
// =============================================

/**
 * Displays the four ensemble members with voice-part color dots.
 *
 * Props:
 *   layout ("grid"|"stack") - 2-column grid or vertical stack
 *   fontSize (number) - base font size in px, default 11
 *
 * Usage: <EnsembleList layout="grid" />
 */
export const ensembleMembers = [
  { name: "Sherry Miller", role: "Soprano", color: voiceColors.soprano },
  { name: "Donna White", role: "Alto", color: voiceColors.alto },
  { name: "Steve Miller", role: "Tenor", color: voiceColors.tenor },
  { name: "Jim Tucker", role: "Bass", color: voiceColors.bass },
];

export function EnsembleList({ layout = "grid", fontSize = 11 }) {
  const isGrid = layout === "grid";
  return (
    <div
      style={{
        display: isGrid ? "grid" : "flex",
        gridTemplateColumns: isGrid ? "1fr 1fr" : undefined,
        flexDirection: isGrid ? undefined : "column",
        gap: isGrid ? "2px 16px" : 2,
      }}
    >
      {ensembleMembers.map((m, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "'Outfit', sans-serif",
            fontSize,
            color: brandColors.ink,
            lineHeight: 2.2,
          }}
        >
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: m.color,
              flexShrink: 0,
            }}
          />
          <span style={{ fontWeight: 500 }}>{m.name}</span>
          <span style={{ color: brandColors.stone, fontSize: fontSize - 1.5 }}>{m.role}</span>
        </div>
      ))}
    </div>
  );
}
