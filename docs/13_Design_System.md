# Design System

## Overview
Symbio utilizes a robust design system built on top of **Tailwind CSS** and **shadcn/ui**. This ensures visual consistency, rapid development, and high accessibility standards across the entire application.

## Core Library: shadcn/ui
We use `shadcn/ui` not as an NPM dependency, but as a collection of re-usable components that are copied directly into our `frontend/src/components/ui` directory. This approach grants us total control over the styling and behavior of foundational elements.

## Component Categories

### 1. Primitives (shadcn/ui)
Foundational UI elements:
- `Button`: Primary, secondary, outline, ghost, and destructive variants.
- `Input` & `Textarea`: For form fields.
- `Dialog` & `Sheet`: For modals and slide-overs.
- `DropdownMenu`: For user avatars and action menus.
- `Avatar`: For displaying user profiles.

### 2. Shared Components
Domain-agnostic composite components:
- `PageHeader`: Standardized title and action button layout for main views.
- `EmptyState`: Visually appealing placeholders when lists or boards are empty.
- `LoadingSpinner`: Standardized loading indicator.

### 3. Feature Components
Domain-specific components:
- `TaskCard`: Draggable component representing a task on a Kanban board.
- `ProjectBoard`: The overarching Kanban layout.
- `CommentThread`: Interface for real-time task discussions.

## Styling Conventions
- **Utility Classes:** We rely strictly on Tailwind CSS. Custom CSS is avoided unless absolutely necessary for complex animations.
- **CSS Variables:** Theming (Light/Dark mode) is achieved using CSS variables defined in `global.css` which are then mapped to Tailwind configuration (e.g., `bg-background`, `text-foreground`).
- **Icons:** We standardize on `lucide-react` for clean, consistent SVG iconography.
