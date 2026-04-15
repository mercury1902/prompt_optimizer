# Design Guidelines

**Version:** 1.0.0  
**Last Updated:** 2026-04-14

## Principles
- One accent system globally: use brand accent only for product emphasis.
- Token-first styling: prefer CSS variables/tokens over hardcoded color values.
- Bilingual UX by toggle: all high-traffic UI strings should support `vi` and `en`.
- Consistent interaction grammar: same pattern should look and behave the same across pages.

## Accent Policy
- Allowed accent family: `brand-*`
- Avoid introducing new primary accents (`blue-*`, `purple-*`, `green-*`, etc.) for product actions.
- Exception: status semantics can use warning/error/success only when tied to state meaning.

## Language Policy
- Supported languages: `vi` and `en`.
- Source of truth: `src/lib/bilingual-language-toggle-translations.ts`
- State management: `src/hooks/use-bilingual-language-toggle-state.ts`
- Storage key: `claudekit:language`

## Core UI Consistency Rules
- Primary navigation, headers, action buttons, and empty states must use shared tokens.
- Icon-only controls must include `aria-label`.
- Focus-visible state is mandatory for keyboard interaction.
- Avoid hover-only discoverability for critical actions.

## Migration Rules
- Legacy neutral components are fully deprecated.
- Do not export deprecated neutral chat components from the public component barrel.
- New development must use `src/components/chat/*` and shared tokenized primitives.

## Quality Gates
- Build must pass.
- Core tests must pass.
- No critical accessibility issues on core routes.
- Mobile layout must be usable at 375px width for primary flows.
