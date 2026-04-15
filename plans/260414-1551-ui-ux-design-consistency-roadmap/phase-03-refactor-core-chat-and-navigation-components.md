# Phase 03 - Refactor Core Chat and Navigation Components

## Context Links
- `./reports/ui-ux-current-state-audit-report.md`
- `../../src/components/chat/chat-frame-with-glassmorphism-and-vietnamese.tsx`
- `../../src/components/chat/vertical-navigation-sidebar.tsx`
- `../../src/components/shared/*`

## Overview
- Priority: P1
- Status: in_progress
- Description: migrate highest-traffic surfaces first: chat shell, input, sidebar, message bubbles.

## Key Insights
- Sidebar behavior is desktop-fixed and mobile-hostile.
- Shared primitives exist but are bypassed in key flows.

## Requirements
- Functional: use shared primitives/tokens for chat + nav components.
- Non-functional: preserve current chat capabilities and SSE behavior.

## Architecture
- Create `ChatShell` structure with tokenized primitives.
- Replace page-level class duplication with component props/variants.
- Add responsive nav pattern: collapsed drawer under `md`.

## Related Code Files
- Modify:
  - `src/components/chat/chat-frame-with-glassmorphism-and-vietnamese.tsx`
  - `src/components/chat/vertical-navigation-sidebar.tsx`
  - `src/components/chat/chat-input-with-keyboard-shortcuts.tsx`
  - `src/components/chat/chat-header-with-status.tsx`
  - `src/components/chat/message-bubble-user-simple.tsx`
  - `src/components/chat/message-bubble-assistant-with-actions.tsx`
- Create:
  - `src/components/shared/navigation-drawer-with-mobile-collapse.tsx`
  - `src/components/shared/chat-surface-layout-primitives.tsx`
- Delete:
  - none (defer removals to Phase 6)

## Implementation Steps
1. Introduce tokenized primitives for button/input/card/status chip.
2. Refactor sidebar into responsive desktop+mobile variants.
3. Normalize message bubble spacing/radius/type scales.
4. Add explicit focus-visible states and aria labels for icon-only controls.
5. Regression test chat send/history/command-palette flows.

## Todo List
- [ ] Chat primitives integrated.
- [x] Mobile drawer behavior implemented.
- [x] Icon buttons labeled for screen readers.
- [x] Core chat tests updated.

## Success Criteria
- Chat and sidebar visually match token contract.
- Mobile viewport supports usable nav and input interactions.

## Risk Assessment
- Risk: behavior regression in complex chat frame.
- Mitigation: incremental extraction + component tests per submodule.

## Security Considerations
- Preserve escape/sanitize behavior in message rendering.
- No weakening of API error handling or session isolation.

## Next Steps
- Phase 4 align guide + prompt-optimizer with same primitives.
