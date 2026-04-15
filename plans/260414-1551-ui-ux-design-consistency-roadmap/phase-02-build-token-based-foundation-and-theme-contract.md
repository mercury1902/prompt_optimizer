# Phase 02 - Build Token-Based Foundation and Theme Contract

## Context Links
- `./reports/ui-ux-current-state-audit-report.md`
- `../260414-1551-ui-ux-design-consistency-roadmap/phase-01-establish-design-governance-and-baseline-audit.md`
- `../../src/styles/global.css`

## Overview
- Priority: P1
- Status: in_progress
- Description: establish foundation/semantic/component tokens and remove ad-hoc color/radius values.

## Key Insights
- Current styling uses heavy hardcoded accent utilities.
- Typography/spacing/motion tokens are incomplete.

## Requirements
- Functional: provide token map covering color/type/spacing/radius/shadow/motion.
- Non-functional: backwards-compatible alias layer for migration window.

## Architecture
- Foundation tokens in `:root`.
- Semantic token layer via CSS custom properties.
- Component token aliases consumed by primitives.

## Related Code Files
- Modify:
  - `src/styles/global.css`
- Create:
  - `src/styles/design-tokens.css`
  - `src/styles/component-tokens.css`
  - `src/styles/theme-contract.css`
- Delete:
  - none

## Implementation Steps
1. Define foundation scales (spacing, radius, typography, elevation, motion).
2. Map semantic roles (`--color-surface-*`, `--color-text-*`, `--color-action-*`).
3. Add component-level aliases for button/card/input/nav/message surfaces.
4. Add lint/check script to detect new hardcoded color literals.

## Todo List
- [ ] Token files added.
- [ ] Semantic mapping complete.
- [ ] Alias compatibility added.
- [ ] Hardcoded-style detector script integrated.

## Success Criteria
- New UI work can style without raw `blue-*`/`purple-*` utilities.
- Token contract documented and testable.

## Risk Assessment
- Risk: visual regressions from token remapping.
- Mitigation: snapshot baseline before replacement.

## Security Considerations
- No auth/data risk.
- Keep deterministic CSS loading order to avoid UI spoofing via overrides.

## Next Steps
- Phase 3 migrate core chat/nav primitives to tokenized components.
