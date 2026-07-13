# Design Foundations: Symbio

## 2. Color Philosophy
Our color system is built on restraint. UI elements should primarily use shades of gray, allowing user-generated content and critical status indicators (errors, success) to stand out.

- **Primary Neutrals:** A deeply tuned grayscale. In Dark Mode, grays should have a very subtle blue/purple undertone to prevent them from feeling "muddy." In Light Mode, they should be crisp and neutral.
- **Accents:** A single primary accent color (e.g., a vibrant, slightly desaturated indigo or stark white/black) used exclusively for primary actions, active states, and focus rings.
- **Semantic Colors:**
  - *Success:* Muted, legible green.
  - *Warning:* Amber/Gold (not pure yellow).
  - *Danger:* A sharp, high-contrast red.
  - *Info:* A calm, distinct blue.
- **Alpha Channels:** We rely heavily on alpha channels (opacity) over solid hex codes for borders, hover states, and backgrounds. This allows the UI to blend seamlessly over different backgrounds and glassmorphism effects.

## 3. Typography System
Typography is the most critical element of the Symbio interface. It must be brutally legible, beautifully proportioned, and fast to render.

- **Typeface:** Inter (or a similar neo-grotesque sans-serif like Geist or Helvetica Now). It provides the mechanical precision required for dense data, with enough character to feel premium.
- **Hierarchy:**
  - *Display (Marketing):* Tighter tracking (letter-spacing), heavier weights.
  - *Headings:* Semi-bold, tight tracking.
  - *Body:* Regular weight, optimal line-height (1.5) for reading.
  - *UI / Microcopy:* Medium weight, slightly increased tracking to maintain legibility at small sizes (11px - 13px).
  - *Monospace:* JetBrains Mono or Geist Mono for code blocks, IDs, and tabular data.
- **Tabular Figures:** Numbers in tables and dashboards must use tabular (monospaced) figures to align perfectly vertically.

## 4. Spacing System
We employ a strict **4pt linear scale** to eliminate guesswork and ensure perfect alignment across the application.

- `space-1`: 4px (micro adjustments, inner component spacing)
- `space-2`: 8px (default padding for small items, gap between icons and text)
- `space-3`: 12px (pill padding, tight list items)
- `space-4`: 16px (standard component padding, baseline gap)
- `space-5`: 20px
- `space-6`: 24px (standard section gap)
- `space-8`: 32px
- `space-12`: 48px (major layout sections)
- `space-16`: 64px

*Rule:* Never use a spacing value outside of this token system (e.g., no 15px or 17px padding).

## 5. Border Radius System
Border radii should feel intentional and slightly softer than rigid squares, but not "bubbly."

- `radius-sm`: 4px (Checkboxes, small badges, keyboard shortcuts)
- `radius-md`: 6px (Standard buttons, inputs, dropdown menus)
- `radius-lg`: 8px (Cards, modal windows, floating command palettes)
- `radius-xl`: 12px (Large hero images, prominent dashboard panels)
- `radius-full`: 9999px (Avatars, circular icon buttons)

## 6. Shadow System
Shadows are used to communicate elevation and z-index, not just for decoration. They should simulate real-world light sources—soft, diffused, and multi-layered.

- `elevation-0`: Flat (panels on the background)
- `elevation-1`: Subtle border or 1px drop shadow with low opacity. Used for standard buttons or cards resting on the surface.
- `elevation-2`: Distinct shadow (dropdowns, popovers). Usually composed of two layers (a sharp ambient shadow and a larger diffuse shadow).
- `elevation-3`: Prominent, floating shadow (Command Palettes, Modals, Toasts). Composed of three or more layers of shadow to create significant depth.
- *Note on Dark Mode:* Shadows are largely ineffective on pure black. In dark mode, elevation is communicated through lighter surface colors and subtle 1px inner borders (`box-shadow: inset 0 1px 0 rgba(255,255,255,0.1)`).

## 14. Dark Theme
Dark mode is treated as a primary citizen, not an afterthought. It should feel sleek, immersive, and easy on the eyes in low-light environments.

- **Backgrounds:** Never use pure `#000000` for the main app background (except maybe on marketing pages). Use a very dark gray (e.g., `#0A0A0A` or `#111111`) to allow for elevation levels (cards that are slightly lighter).
- **Text:** Avoid pure `#FFFFFF` for body text to reduce eye strain. Use `#EDEDED` or a 90% opacity white.
- **Borders:** Use low-opacity white (e.g., `rgba(255, 255, 255, 0.1)`) instead of solid gray hexes for borders.

## 15. Light Theme
Light mode should feel expansive, crisp, and paper-like.

- **Backgrounds:** Pure white (`#FFFFFF`) or off-white (`#F9F9F9`) for the main canvas.
- **Text:** Nearly black (e.g., `#111111` or `#1A1A1A`) for ultimate contrast.
- **Borders:** Subtle gray (`#EAEAEA`) to define edges without overpowering the content.

## 20. Design Tokens
The foundation of Symbio's UI is entirely tokenized. No hardcoded hex values, pixels, or timing functions in the CSS.

**Token Naming Convention (Semantic):**
- `{category}-{property}-{variant}-{state}`
- Examples: 
  - `color-bg-primary`
  - `color-text-muted`
  - `color-border-hover`
  - `space-layout-sidebar`
  - `font-size-heading-1`
  - `motion-duration-fast`

Tokens bridge the gap between Figma and code, ensuring that a change to the design system propagates instantly across the entire platform.
