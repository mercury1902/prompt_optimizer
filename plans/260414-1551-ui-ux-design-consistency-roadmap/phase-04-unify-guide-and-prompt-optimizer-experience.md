# Phase 04 - Unify Guide and Prompt Optimizer Experience

## Context Links
- `./reports/ui-ux-current-state-audit-report.md`
- `../../src/pages/guide/index.astro`
- `../../src/pages/guide/commands.astro`
- `../../src/pages/guide/prompt-optimizer.astro`
- `../../src/components/command-guide/*`

## Overview
- Priority: P1
- Status: in_progress
- Description: unify non-chat pages into same design system language and interaction grammar.

## Key Insights
- Prompt optimizer uses separate color/action semantics vs chat/guide.
- Visual hierarchy patterns vary by page (card depth, badges, spacing).

## Requirements
- Functional: all guide pages consume shared tokens and primitives.
- Non-functional: preserve current command-discovery and optimizer functionality.

## Architecture
- Shared page-shell components for guide pages.
- Reusable section header, stat card, action cluster, and tab patterns.
- One iconography + status-color mapping standard.

## Related Code Files
- Modify:
  - `src/pages/guide/index.astro`
  - `src/pages/guide/commands.astro`
  - `src/pages/guide/prompt-optimizer.astro`
  - `src/components/command-guide/command-browser-with-search.tsx`
  - `src/components/command-guide/decision-tree-with-recommendations.tsx`
  - `src/components/command-guide/prompt-optimizer-chat.tsx`
  - `src/components/command-guide/optimized-prompt-result-view.tsx`
- Create:
  - `src/components/shared/guide-page-section-primitives.tsx`
  - `src/components/shared/status-badge-with-token-variants.tsx`
- Delete:
  - none

## Implementation Steps
1. Replace page-level ad-hoc classes with shared section primitives.
2. Normalize tab/button/badge states to shared variants.
3. Standardize copy tone and locale strategy.
4. Align spacing/radius/elevation to token scale.
5. Validate interactions in keyboard and touch contexts.

## Todo List
- [ ] Shared guide primitives adopted.
- [x] Optimizer tabs/actions standardized.
- [x] Locale/copy consistency pass completed.
- [x] Cross-page navigation feels consistent.

## Success Criteria
- User perceives one product, not separate mini-UIs.
- Same interaction pattern yields same visual/state feedback.

## Risk Assessment
- Risk: large prompt-optimizer file complexity slows migration.
- Mitigation: split file into small containers before style migration.

## Security Considerations
- Preserve safe rendering for optimized prompt content and copied command values.

## Next Steps
- Phase 5 run accessibility and responsive hardening on migrated flows.
