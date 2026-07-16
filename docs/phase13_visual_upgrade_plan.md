# Phase 13 — Visual Upgrade Plan

## Current UI Audit
1. **Global Shell (`layout.tsx`, `Sidebar.tsx`, `Navbar.tsx`)**: The sidebar is functional but lacks premium polish (e.g., gradient glows, keyboard shortcut hints, complex active states). The navbar is currently a basic flex container.
2. **Dashboard (`dashboard/page.tsx`)**: Contains basic `GlassCard` elements. It lacks a hero area, AI insight surfaces, and a polished activity timeline.
3. **Authentication (`login`, `register`, etc.)**: Currently a standard centered card layout on a solid background. Needs animated backgrounds, glow effects, and better micro-interactions.
4. **Data Pages & Tables (`organizations`, `workspaces`, etc.)**: Uses basic HTML tables. Lacks sticky headers, row hover animations, and premium status badges.
5. **Empty States & Skeletons**: Standard "No data found" text. Needs illustrations, clear CTAs, and a robust shimmer skeleton system for loading states.

## Proposed Changes
We will upgrade Symbio into a premium, world-class product experience with a "futuristic AI-native collaboration operating system" aesthetic.

## Implementation Order & Affected Files

### Sprint 1: Application Shell
- `apps/web/src/app/(dashboard)/layout.tsx`
- `packages/ui/src/components/Sidebar.tsx`
- `packages/ui/src/components/Navbar.tsx`

### Sprint 2: Dashboard Redesign
- `apps/web/src/app/(dashboard)/dashboard/page.tsx`

### Sprint 3: Authentication Experience
- `apps/web/src/app/(auth)/login/page.tsx`
- `apps/web/src/app/(auth)/register/page.tsx`
- `apps/web/src/app/(auth)/forgot-password/page.tsx`
- `apps/web/src/app/(auth)/reset-password/page.tsx`
- `apps/web/src/app/(auth)/verify-email/page.tsx`

### Sprint 4: Data Pages
- `apps/web/src/app/(dashboard)/organizations/page.tsx`
- `apps/web/src/app/(dashboard)/workspaces/page.tsx`
- `apps/web/src/app/(dashboard)/storage/page.tsx`
- `apps/web/src/app/(dashboard)/audit-logs/page.tsx`

### Sprint 5: Mobile + Accessibility Polish
- Global QA and polish pass.
