# UI Architecture & Components: Symbio

## 7. Iconography
Icons must be functional, immediately recognizable, and visually balanced.

- **Style:** Line icons, monoline weight (typically 1.5px or 2px, scaling with size). Similar to Lucide or Phosphor icons. 
- **Sizing:** Fixed bounding boxes (16x16, 20x20, 24x24).
- **Simplicity:** Remove unnecessary details. An icon is a signpost, not an illustration.
- **Color:** Icons inherit the text color by default (using `currentColor` in SVG). Muted by default, transitioning to primary or accent on hover/active states.

## 9. Dashboard Layout Philosophy
The dashboard is a workspace, not a gallery. It must optimize for data density, scannability, and quick actions.

- **Edge-to-Edge:** Maximize screen real estate. Use fluid layouts that adapt gracefully from laptop screens to ultrawide monitors.
- **Information Density:** Offer toggles for user preference (e.g., "Comfortable" vs. "Compact" view). "Compact" should reduce padding and font size for power users.
- **Progressive Disclosure:** Hide secondary actions behind hover states or contextual menus (e.g., "...") to keep the default view uncluttered.
- **Keyboard First:** Everything visible on the dashboard should be accessible via a keyboard shortcut or the Command Palette (`Cmd + K`).

## 10. Sidebar Philosophy
The sidebar is the compass of the application. It provides context without overwhelming the content.

- **Resizable & Collapsible:** Users must be able to adjust the width or collapse it entirely to focus on the main canvas (using a shortcut like `Cmd + \`).
- **Hierarchy:** Clear distinction between Global navigation (Search, Inbox, Settings) and Contextual navigation (Projects, Teams, Views).
- **Hover States:** Sidebar items should have a very subtle background highlight on hover, with a bolder active state (often indicated by a vertical bar on the left edge or a distinct background color).
- **Actionable:** Hovering over a section header should reveal quick actions (e.g., a `+` icon to create a new project).

## 11. Card System
Cards encapsulate discrete pieces of information or interactive objects.

- **Structure:** 
  - *Header:* Optional title, icon, and contextual actions.
  - *Body:* The primary content or data visualization.
  - *Footer:* Metadata (timestamps, avatars) or secondary actions.
- **Visuals:** Cards should have a subtle 1px border (`var(--color-border)`) and a slight radius (`radius-lg`).
- **Interactivity:** If the entire card is clickable, the hover state should subtly lift the card (increase shadow) or alter the border color. The cursor should change to a pointer.
- **Nesting:** Avoid nesting cards within cards. This creates visual noise (the "box-in-box" problem). Use lines or background colors for grouping within a card instead.
