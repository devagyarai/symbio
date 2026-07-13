# Experience Patterns: Symbio

## 12. Data Visualization Guidelines
Charts and graphs must be as beautiful as they are legible. They should not look like generic charting library defaults.

- **Color Palettes:** Avoid default D3/Chart.js rainbow palettes. Use monochromatic gradients, or carefully selected categorical colors that align with our brand and have guaranteed contrast ratios.
- **Minimal Gridlines:** Gridlines should be nearly invisible (e.g., 5% opacity). Remove vertical gridlines entirely in most time-series charts.
- **Tooltips:** Hovering over data points must reveal a crisp, floating tooltip that snaps to the nearest data point. It should contain exact values and relevant context, styled like a mini-card.
- **Empty/Zero States:** If a chart has no data, do not show a flat line. Show a beautifully styled empty state within the chart's bounding box.

## 13. Motion Principles
Motion should feel natural, physical, and purposeful. It guides the eye and provides spatial context.

- **Spring Physics:** Prefer spring-based animations over linear easings (like `ease-in-out`). Springs feel organic, snappy, and interruptible.
- **Speed:** UI animations must be fast. Anything longer than 200ms feels sluggish. Target 100-150ms for micro-interactions (hover, click) and 200-300ms for macro-interactions (opening modals, page transitions).
- **Choreography:** When multiple elements appear, they should stagger slightly (e.g., 20ms delay between list items) to create a cascading effect.
- **Accessibility:** Respect `prefers-reduced-motion`. If a user has this enabled at the OS level, gracefully fallback to instant transitions or very subtle crossfades.

## 17. Empty States
An empty state is an onboarding opportunity. It should never be a dead end.

- **Anatomy:**
  1. A subtle, high-quality icon or abstract geometric illustration.
  2. A clear, concise heading explaining what goes here.
  3. A helpful subtext explaining *why* it's empty or *how* to populate it.
  4. A primary Call-to-Action (CTA) button to create the first item.
- **Tone:** Encouraging, not apologetic. (e.g., "Create your first project" instead of "You don't have any projects yet").

## 18. Loading States
Loading should feel fast, even when it isn't.

- **Skeletons over Spinners:** For content areas, use skeleton screens (pulsing gray blocks matching the layout of the loaded content) rather than a generic centered loading spinner. This reduces cognitive load when the content finally pops in.
- **Optimistic UI:** When a user takes an action (e.g., creating a task), instantly render the result in the UI *before* the server responds. Handle errors gracefully in the background. This makes the app feel infinitely fast.
- **Progressive Rendering:** Load the shell (sidebar, header) instantly, then stream in the heavier content.

## 19. Error States
Errors will happen. The UI must handle them with grace and provide a path forward.

- **In-line Validation:** Form errors should appear instantly near the input field, not just at the top of the page after submission.
- **Non-blocking Toasts:** For background failures (e.g., "Failed to save draft"), use a subtle toast notification at the bottom edge of the screen. Do not interrupt the user's flow with a modal dialog.
- **Actionable:** Every error message should explain *what* went wrong and *how* to fix it, or offer a "Retry" button. Never show raw stack traces to an end user.
- **Tone:** Objective and helpful. Never blame the user.
