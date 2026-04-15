# Phase 05 - Accessibility WCAG 2.1 Compliance and Mobile Hardening

## Context Links
- `./reports/ui-ux-current-state-audit-report.md`
- `../../playwright.config.ts`
- `../../tests/e2e/*`
- `../../e2e/*`

## Overview
- Priority: P1
- Status: in_progress
- Description: turn accessibility and responsiveness into enforceable gates, not manual best effort.

## Key Insights
- Existing tests are mostly behavioral and not WCAG-scored.
- Some tests still assume outdated UI copy/structure.

## Requirements
- Functional: add automated a11y and viewport validation for core routes.
- Non-functional: keep CI runtime reasonable and stable.

## Architecture
- Add axe-based checks per core page.
- Add responsive snapshot matrix (375, 768, 1280).
- Add keyboard navigation smoke test per route.

## Related Code Files
- Modify:
  - `playwright.config.ts`
  - `tests/e2e/vertical-sidebar-navigation-between-pages-e2e.test.ts`
  - `tests/e2e/chat-flow-message-send-and-receive-e2e.test.ts`
  - `tests/e2e/prompt-optimizer-user-input-to-result-flow-e2e.test.ts`
- Create:
  - `tests/e2e/accessibility-wcag-core-routes-e2e.test.ts`
  - `tests/e2e/responsive-layout-regression-core-routes-e2e.test.ts`
  - `tests/e2e/keyboard-navigation-core-routes-e2e.test.ts`
- Delete:
  - deprecate outdated duplicated `e2e/*` tests after parity confirmed

## Implementation Steps
1. Add axe integration and fail CI on critical violations.
2. Create breakpoint test matrix with screenshot baselines.
3. Enforce focus-visible checks and tab order on key controls.
4. Normalize aria-label for icon-only buttons.
5. Remove or rewrite outdated tests tied to old copy.

## Todo List
- [ ] Axe gate running in CI.
- [x] Breakpoint snapshots stable.
- [x] Keyboard smoke tests passing.
- [ ] Outdated duplicate tests removed/replaced.

## Success Criteria
- Core routes pass WCAG critical checks.
- No major layout break at supported breakpoints.

## Risk Assessment
- Risk: flaky UI tests during animation-heavy states.
- Mitigation: reduce animation in test mode; use deterministic waits.

## Security Considerations
- Do not expose internal debug/test routes in production builds.

## Next Steps
- Phase 6 operationalize metrics and rollout governance.
