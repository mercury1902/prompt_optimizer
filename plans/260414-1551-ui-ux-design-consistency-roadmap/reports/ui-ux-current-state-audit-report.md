---
title: UI/UX Current State Audit Report
status: completed
created: 2026-04-14
scope: src/pages, src/components, src/styles, tests/e2e
---

# UI/UX Current State Audit Report

## Scope and Method
- Code audit on `src/pages`, `src/components`, `src/styles/global.css`
- Test coverage audit on `tests/e2e`, `e2e`, and component tests
- Design-consistency signal extraction: color tokens, hardcoded values, component size, accessibility attributes

## Current State Analysis (Visual Consistency)

### Strengths
- A shared glassmorphism baseline exists in `src/styles/global.css` with brand tokens (`--brand-*`) and depth/blur scales.
- New chat flow is modularized compared to old monolith (`chat-frame-with-glassmorphism-and-vietnamese.tsx` split into subcomponents).
- Core pages use one shell pattern: left sidebar + main area (`/`, `/guide/*`).

### Design Debt and Inconsistency Signals
- Token drift is high:
  - `brand-*` class usage: **97**
  - Other accent colors (`blue|purple|green|red|yellow|indigo|pink`): **573**
  - Gray palette usage: **820**
- Hardcoded color literals remain common: **61** `rgba(...)` + **17** hex literals.
- Multiple visual systems co-exist:
  - Legacy neutral UI (`ChatContainer`, `ChatInput`, `MessageList`, `UserMessage`, `AssistantMessage`)
  - Glassmorphism chat UI (`src/components/chat/*`)
  - Guide/prompt-optimizer local styles with separate color semantics.
- Design-system primitives exist but are under-used:
  - `shared/glass-card-with-depth-layer.tsx`
  - `shared/glass-button-neumorphic.tsx`
  - `shared/animated-border-with-gradient.tsx`
- `docs/design-guidelines.md` is missing, so implementation has no project-level source of truth for UI decisions.

### Maintainability Debt (Direct UX Impact)
- Many UI files exceed 200 LOC; largest include:
  - `_deprecated/ChatBot.tsx` (1489)
  - `command-detail-view-with-tabs-and-copy.tsx` (588)
  - `command-guide/prompt-optimizer-chat.tsx` (587)
  - `chat/chat-frame-with-glassmorphism-and-demo.tsx` (572)
  - `chat/chat-frame-with-glassmorphism-and-vietnamese.tsx` (522)
- Large files correlate with repeated class strings and duplicated interaction patterns.

## User Experience Assessment

### Primary Flows Reviewed
- Chat flow: `/` (+ deprecated `/chat`)
- Guide flow: `/guide/`, `/guide/commands`, `/guide/prompt-optimizer`
- Shared navigation: `vertical-navigation-sidebar.tsx`

### Friction Points
- Sidebar is fixed `w-64` even on mobile; test explicitly expects sidebar always visible on 375px width. This compresses content and increases cognitive load.
- Nav includes non-functional destinations (`History`, `Settings` with `href="#"`), which appears actionable but does not navigate.
- Language/voice is mixed (Vietnamese + English labels), increasing comprehension cost for single-locale users.
- Duplicate patterns (buttons/cards/status chips) vary by page; users re-learn interaction cues across sections.

### Accessibility (WCAG 2.1)
- Positive:
  - Many components include `aria-*` and semantic roles.
  - Keyboard submission and command shortcuts exist.
- Gaps:
  - Button inventory: **112** `<button>` tags, only **15** include explicit `aria-label` and **12** include `title`.
  - Focus-visible behavior is inconsistent (many controls rely on hover styles only).
  - Motion-reduction handling is partial; animated backgrounds/pulses are still broad in active views.
  - No dedicated automated WCAG gate (no axe/pa11y pipeline) in existing tests.

### Mobile Responsiveness
- Some responsive classes exist (`sm:`, `md:`), but mobile-first layout strategy is not systematic.
- Persistent desktop sidebar on small screens is the highest-impact responsive issue.
- Dense action clusters (chat input + suggestions + command controls) may reduce touch accuracy.

## Design System Research Summary (Project-Specific)

### Recommended Architecture
- Layer 1: Foundation tokens in CSS variables (`colors`, `typography`, `spacing`, `radius`, `shadow`, `motion`, `z-index`).
- Layer 2: Semantic tokens (`surface-primary`, `text-muted`, `state-success`, etc.) mapped from foundation.
- Layer 3: Component tokens and primitives (`Button`, `Card`, `Input`, `Badge`, `NavItem`, `MessageBubble`).
- Layer 4: Page patterns (`ChatShell`, `GuideShell`, `OptimizerWorkspace`, `PanelLayout`).

### Documentation Contracts Needed
- `docs/design-guidelines.md` (new source of truth)
- `docs/code-standards.md` add enforcement rules for token-only styling and component reuse
- Component inventory matrix: owner, status, replacement path, deprecation deadline

## Quality-Gate Baseline
- Current tests are mostly functional behavior checks.
- Needed gates for rollout:
  - Visual consistency regression checks
  - Automated accessibility checks (axe in CI)
  - Responsive viewport snapshots (mobile/tablet/desktop)
  - Token coverage threshold and component reuse threshold

## Immediate Priorities (High Impact / Low Regret)
1. Build token contract + semantic layer before more UI feature work.
2. Standardize core shared components used by chat + guide pages.
3. Fix mobile navigation pattern (collapsible/sidebar drawer).
4. Add WCAG + responsive CI gates before broad migration.

## Decision Lock (User Confirmed)
1. Locale strategy: bilingual toggle.
2. Legacy neutral fallback: fully deprecated.
3. Timeline: no hard deadline.
4. Accent policy: one global accent system only.

## Unresolved Questions
1. KPI source of truth for UX reporting (analytics vs synthetic vs hybrid)?
