# The Masterpieces — Brand System

## Identity

**The Masterpieces** are a mixed vocal quartet with piano accompaniment representing Texas Master Chorale (TMC), a 100-voice auditioned choir founded in 1986 in Tomball, Texas. Members of TMC have performed at venues worldwide including the Sistine Chapel. The Masterpieces bring that caliber of artistry to intimate settings — galas, luncheons, private parties, senior communities, churches, and corporate events.

**Members:** Sherry Miller (Soprano), Donna White (Alto), Steve Miller (Tenor), Jim Tucker (Bass)
**Manager:** Beth Tucker, 281-804-4360
**Website:** texasmasterchorale.org
**Repertoire:** Jazz standards, swing, American Songbook, pop classics, Christmas, patriotic. Programs tailored per event.
**Fees:** Tax-deductible donation to Texas Master Chorale, a 501(c)(3) nonprofit.

-----

## Brand Personality

Sophisticated but warm. Colorful but controlled. Musical at its core. The brand should feel like a world-class concert poster for a jazz-inflected vocal ensemble — not a community group flyer. Every design element should communicate music visually.

**Voice:** Confident, inviting, refined. Never stiff. Never casual.
**Feel:** The energy of a jazz club meets the polish of a concert hall.

-----

## Color Palette

### Foundation Colors (80% of visual weight)

|Name         |Hex      |CSS Variable    |Usage                                 |
|-------------|---------|----------------|--------------------------------------|
|Midnight Navy|`#0d1a30`|`--mp-navy`     |Primary backgrounds, text on light    |
|Gold         |`#e8b430`|`--mp-gold`     |Primary accent, staff lines, headlines|
|Amber        |`#f0c850`|`--mp-amber`    |Warm highlight, treble clef           |
|Cream        |`#fdf8ee`|`--mp-cream`    |Light backgrounds                     |
|Parchment    |`#f4ede0`|`--mp-parchment`|Secondary light, borders              |

### Musical Note Colors (accent usage — each note on the staff is a different color)

|Name   |Hex      |CSS Variable  |Voice Association|
|-------|---------|--------------|-----------------|
|Rose   |`#d03a6a`|`--mp-rose`   |Soprano          |
|Copper |`#e07830`|`--mp-copper` |Alto             |
|Teal   |`#20a89a`|`--mp-teal`   |Tenor            |
|Iris   |`#7b52c4`|`--mp-iris`   |Bass             |
|Coral  |`#e05545`|`--mp-coral`  |Accent note      |
|Sky    |`#3898d4`|`--mp-sky`    |Accent note      |
|Magenta|`#c035a0`|`--mp-magenta`|Accent note      |

### Utility

|Name     |Hex      |CSS Variable   |Usage                      |
|---------|---------|---------------|---------------------------|
|Deep Navy|`#152242`|`--mp-deep`    |Hover states, darker panels|
|Sapphire |`#1c3564`|`--mp-sapphire`|Radial glow overlays       |
|Ink      |`#1a1a2e`|`--mp-ink`     |Body text on light         |
|Stone    |`#6e6e82`|`--mp-stone`   |Secondary text, captions   |

### Gradients

- **Five-Bar Stripe:** Linear gradient using `gold → copper → rose → teal → iris` in equal segments. Used as a 2-4px bar at the top/bottom of cards, headers, and containers. This is the primary brand signature element.
- **Staff Glow:** Radial gradient `radial-gradient(ellipse at 50% 35%, var(--mp-sapphire) 0%, transparent 65%)` applied over navy backgrounds for depth.
- **Rainbow Bar:** `linear-gradient(90deg, gold, amber, copper, coral, rose, magenta, iris, sky, teal)` for full-spectrum accents.

-----

## Typography

### Display / Headlines

- **Font:** Cormorant Garamond
- **Weights:** 600 (semibold) for headlines, 700 (bold) for the wordmark
- **Style:** Uppercase with wide letter-spacing (3-5px) for the brand name
- **Usage:** Page titles, section headers, the “MASTERPIECES” wordmark
- **Load:** `https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500`

### Body

- **Font:** EB Garamond
- **Weights:** 400 (regular), 500 (medium)
- **Style:** Normal case, italic for pull quotes and attributions
- **Usage:** Paragraph text, descriptions, program notes
- **Load:** `https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400`

### Functional / UI

- **Font:** Outfit
- **Weights:** 200 (thin for “THE”), 300 (light), 400 (regular), 500 (medium), 600 (semibold)
- **Style:** Normal case or uppercase with letter-spacing for labels
- **Usage:** Navigation, buttons, dates, contact info, captions, form labels
- **Load:** `https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700`

-----

## Musical Design Elements

These are the visual DNA of the brand. They should appear consistently across all surfaces.

### 1. Five-Bar Stripe

A horizontal bar divided into 5 equal color segments: gold, copper, rose, teal, iris. Height: 2-4px. Appears at the top or bottom of headers, cards, footers, and containers. This is the single most recognizable brand element.

### 2. Musical Staff

Five horizontal lines rendered as thin strokes (0.4-0.6px) in gold on dark or navy on light. Spacing between lines should be even. The staff serves as a background texture and a structural element for placing notes.

### 3. Treble Clef

An SVG treble clef rendered in gold/amber. Used at the start of staff lines, as a standalone icon, or paired with the wordmark. See `brand-components.jsx` for the exact path data.

### 4. Colored Notes

Quarter notes, eighth notes, and half notes placed on the staff at varying heights. Each note is a different color from the note palette. Notes ascend from bass (low, iris) to soprano (high, rose) when representing the four voices. In decorative contexts, use the full color range.

### 5. Fermata

An arc with a dot below it (musical hold/sustain symbol). Used sparingly as a decorative accent, particularly effective above the wordmark or at the end of a musical phrase.

-----

## Logo Usage

### Primary Lockup

The wordmark “THE MASTERPIECES” in Cormorant Garamond 700, uppercase, letter-spacing 3-4px. Below it, a musical staff with treble clef and colored notes. “THE” appears above in Outfit 200, letter-spacing 6px, in gold.

### Compact Lockup

Treble clef to the left, wordmark stacked to the right. Staff with notes below as an underline.

### Icon / Avatar

Circular mark with concentric staff rings, scattered colored note dots, and a centered treble clef. Four voice-part color arcs on the outer ring (rose, copper, teal, iris).

### Minimum Clear Space

Allow at least 1x the height of the “M” in MASTERPIECES on all sides.

### On Dark Backgrounds

- Wordmark: `--mp-cream`
- Staff lines: `--mp-gold` at 35% opacity
- “THE” label: `--mp-gold`
- Notes: full color from the note palette

### On Light Backgrounds

- Wordmark: `--mp-navy`
- Staff lines: `--mp-navy` at 15% opacity
- “THE” label: `--mp-gold`
- Notes: full color from the note palette

-----

## Component Patterns

### Card / Container

- Background: `--mp-cream` or `--mp-navy`
- Border-radius: 12-16px
- Five-bar stripe at top (2-3px)
- Optional staff glow overlay on navy backgrounds

### Header Bar

- Background: `--mp-navy`
- Five-bar stripe at bottom edge
- Wordmark centered or left-aligned with treble clef
- Staff glow overlay for depth

### Button (Primary)

- Background: `--mp-navy`
- Text: `--mp-gold`, Outfit 500, letter-spacing 3px, uppercase
- Border-radius: 6px
- Padding: 10px 24px

### Button (Secondary)

- Background: transparent
- Border: 1px solid `--mp-gold`
- Text: `--mp-gold`
- Same radius and padding as primary

### Section Header

- Font: Outfit 500, 9-10px, uppercase, letter-spacing 3px
- Color: one of the note accent colors (rotate per section)

### Tags / Chips

- Background: note color at 10% opacity
- Border: 1px solid note color at 30% opacity
- Text: note color, Outfit 500, 8px
- Border-radius: 4px
- Padding: 3px 8px

-----

## Voice-Part Color Mapping

When displaying the four ensemble members, each voice part has a designated color:

|Part   |Singer       |Color           |Variable     |
|-------|-------------|----------------|-------------|
|Soprano|Sherry Miller|Rose `#d03a6a`  |`--mp-rose`  |
|Alto   |Donna White  |Copper `#e07830`|`--mp-copper`|
|Tenor  |Steve Miller |Teal `#20a89a`  |`--mp-teal`  |
|Bass   |Jim Tucker   |Iris `#7b52c4`  |`--mp-iris`  |

Display as a 5px colored dot followed by the name and voice part label.

-----

## Do / Don’t

**Do:**

- Use the musical staff and colored notes as primary visual elements
- Let the five-bar stripe appear on every major container or section break
- Use the full note-color spectrum — variety is the point
- Keep navy as the dominant dark color
- Use generous white space around the wordmark

**Don’t:**

- Use the note colors as full backgrounds (they are accents only)
- Render the treble clef at sizes below 20px height
- Use more than 2 typefaces on a single component (pick 2 of the 3)
- Place the wordmark without at least one musical element nearby
- Use drop shadows on text
- Use gradients on text (exception: the wordmark in hero contexts)