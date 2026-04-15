---
title: "Prompt Optimizer Refactor Plan"
description: "Refactor Prompt Optimizer into canonical chatbot-like experience with history, compare diff, and persisted conversation context."
status: pending
priority: P1
effort: 14h
branch: master
tags: [prompt-optimizer, routing, ui, state, localstorage, e2e]
created: 2026-04-15
---

## Objectives
1. Make `/guide/prompt-optimizer` canonical and redirect `/` to it.
2. Replace heavy static intro with top-right collapsible info accordion.
3. Move to chatbot-first layout: output area + sticky bottom composer.
4. Add copy action with visual feedback for each optimized output.
5. Add compare mode with side-by-side + simple diff highlighting.
6. Add conversation sessions: context label/thread id, new session, history panel (desktop sidebar + mobile drawer).
7. Add keyboard shortcuts (`Ctrl+Enter` submit, `Escape` collapse panels), typing dots, auto-resize, theme consistency.
8. Implement React Context state + localStorage persistence with timestamps and follow-up payload support.
9. Implement optimistic UI updates.

## Ordered Implementation Plan
1. Routing and canonical URL
- Convert [src/pages/index.astro](D:/project/Clone/ck/claudekit-chatbot-astro/src/pages/index.astro) to redirect to `/guide/prompt-optimizer`.
- Keep chat reachable via [src/pages/chat.astro](D:/project/Clone/ck/claudekit-chatbot-astro/src/pages/chat.astro).
- Update nav `Chat` link to `/chat` in [src/components/chat/vertical-navigation-sidebar.tsx](D:/project/Clone/ck/claudekit-chatbot-astro/src/components/chat/vertical-navigation-sidebar.tsx).

2. Split oversized optimizer modules (KISS + <200 LOC target)
- Refactor [src/components/command-guide/prompt-optimizer-chat.tsx](D:/project/Clone/ck/claudekit-chatbot-astro/src/components/command-guide/prompt-optimizer-chat.tsx) into small focused components/hooks.
- Refactor [src/components/command-guide/optimized-prompt-result-view.tsx](D:/project/Clone/ck/claudekit-chatbot-astro/src/components/command-guide/optimized-prompt-result-view.tsx) into result card + compare view.
- New suggested modules:
  - `src/components/command-guide/prompt-optimizer-shell-with-history-layout.tsx`
  - `src/components/command-guide/prompt-optimizer-conversation-message-list.tsx`
  - `src/components/command-guide/prompt-optimizer-composer-with-shortcuts.tsx`
  - `src/components/command-guide/prompt-optimizer-intro-info-accordion.tsx`
  - `src/components/command-guide/prompt-optimizer-history-sidebar-and-mobile-drawer.tsx`
  - `src/components/command-guide/prompt-optimizer-output-card-with-copy-actions.tsx`
  - `src/components/command-guide/prompt-optimizer-compare-view-with-diff-highlighting.tsx`

3. Conversation state architecture
- Add context store:
  - `src/contexts/prompt-optimizer-conversation-context.tsx`
- Add persistence + payload utilities:
  - `src/utils/prompt-optimizer-local-storage-thread-persistence.ts`
  - `src/utils/prompt-optimizer-conversation-payload-builder.ts`
- State model (minimal):
  - `threads[]`, `activeThreadId`, `ui` panel flags.
  - `thread`: `id`, `label`, `createdAt`, `updatedAt`, `messages[]`.
  - `message`: `id`, `role`, `content`, `createdAt`, `status` (`pending|done|error`), `parsedResult?`, `originalInput?`.

4. Canonical UI reshape
- Simplify [src/pages/guide/prompt-optimizer.astro](D:/project/Clone/ck/claudekit-chatbot-astro/src/pages/guide/prompt-optimizer.astro): remove heavy static cards.
- Add top-right info button → accordion (default collapsed), keep concise title context.
- Primary layout:
  - Desktop: history sidebar + conversation pane.
  - Mobile: conversation pane + history drawer toggle.

5. Message flow, optimistic updates, follow-up context
- On submit:
  - Immediately append user message + assistant placeholder (`pending`) in active thread.
  - Persist thread snapshot to localStorage.
  - Build Fireworks payload from thread history (trimmed window, include previous optimized outputs in assistant turns).
- On response:
  - Replace placeholder with finalized parsed result + timestamps.
  - Update thread label from first user prompt if label empty.
- On error:
  - Mark placeholder as `error`, keep message visible for retry.

6. Compare mode + copy UX
- Extend parser output in [src/utils/prompt-response-parser.ts](D:/project/Clone/ck/claudekit-chatbot-astro/src/utils/prompt-response-parser.ts) if needed for normalized compare text.
- Add simple diff utility:
  - `src/utils/prompt-optimizer-simple-diff-highlighting.ts`
- Compare view behavior:
  - Side-by-side original vs optimized.
  - Token/line additions highlighted with accent surface; removals muted/red tint.
- Copy behavior:
  - Per output card button with temporary success state (`Copied` + check icon).

7. Keyboard + interaction polish
- `Ctrl+Enter` submit, `Enter` newline, `Escape` collapses templates/history/info accordion.
- Keep typing dots loading and auto-resize textarea.
- Ensure all icon-only controls have aria-labels.

8. I18n + style consistency
- Add new i18n keys in [src/lib/bilingual-language-toggle-translations.ts](D:/project/Clone/ck/claudekit-chatbot-astro/src/lib/bilingual-language-toggle-translations.ts).
- Add scoped classes/animations in [src/styles/global.css](D:/project/Clone/ck/claudekit-chatbot-astro/src/styles/global.css) for diff highlighting + panel transitions.
- Use existing `--app-*` tokens only (no new accent family).

9. Test updates
- Update route assumptions (`/` redirects, chat at `/chat`) in:
  - [e2e/nav-sidebar-e2e.test.ts](D:/project/Clone/ck/claudekit-chatbot-astro/e2e/nav-sidebar-e2e.test.ts)
  - [tests/e2e/vertical-sidebar-navigation-between-pages-e2e.test.ts](D:/project/Clone/ck/claudekit-chatbot-astro/tests/e2e/vertical-sidebar-navigation-between-pages-e2e.test.ts)
  - [tests/e2e/keyboard-navigation-core-routes-e2e.test.ts](D:/project/Clone/ck/claudekit-chatbot-astro/tests/e2e/keyboard-navigation-core-routes-e2e.test.ts)
- Update optimizer behavior tests:
  - [e2e/prompt-optimizer-e2e.test.ts](D:/project/Clone/ck/claudekit-chatbot-astro/e2e/prompt-optimizer-e2e.test.ts)
  - [tests/e2e/prompt-optimizer-user-input-to-result-flow-e2e.test.ts](D:/project/Clone/ck/claudekit-chatbot-astro/tests/e2e/prompt-optimizer-user-input-to-result-flow-e2e.test.ts)
- Update core route smoke arrays if needed:
  - [tests/e2e/accessibility-wcag-core-routes-e2e.test.ts](D:/project/Clone/ck/claudekit-chatbot-astro/tests/e2e/accessibility-wcag-core-routes-e2e.test.ts)
  - [tests/e2e/responsive-layout-regression-core-routes-e2e.test.ts](D:/project/Clone/ck/claudekit-chatbot-astro/tests/e2e/responsive-layout-regression-core-routes-e2e.test.ts)

## File-by-File Change List
- [src/pages/index.astro](D:/project/Clone/ck/claudekit-chatbot-astro/src/pages/index.astro): redirect to canonical optimizer route.
- [src/pages/chat.astro](D:/project/Clone/ck/claudekit-chatbot-astro/src/pages/chat.astro): keep chat route stable (content unchanged/minor metadata only).
- [src/pages/guide/prompt-optimizer.astro](D:/project/Clone/ck/claudekit-chatbot-astro/src/pages/guide/prompt-optimizer.astro): remove heavy intro, host new shell.
- [src/components/chat/vertical-navigation-sidebar.tsx](D:/project/Clone/ck/claudekit-chatbot-astro/src/components/chat/vertical-navigation-sidebar.tsx): chat link target + active state mapping.
- [src/components/command-guide/prompt-optimizer-chat.tsx](D:/project/Clone/ck/claudekit-chatbot-astro/src/components/command-guide/prompt-optimizer-chat.tsx): split + adapter.
- [src/components/command-guide/optimized-prompt-result-view.tsx](D:/project/Clone/ck/claudekit-chatbot-astro/src/components/command-guide/optimized-prompt-result-view.tsx): split compare/copy concerns.
- [src/utils/prompt-response-parser.ts](D:/project/Clone/ck/claudekit-chatbot-astro/src/utils/prompt-response-parser.ts): parser support for compare/copy normalization.
- [src/lib/bilingual-language-toggle-translations.ts](D:/project/Clone/ck/claudekit-chatbot-astro/src/lib/bilingual-language-toggle-translations.ts): new copy/history/context labels + shortcut hints.
- [src/styles/global.css](D:/project/Clone/ck/claudekit-chatbot-astro/src/styles/global.css): diff highlight, panel/drawer motion.
- New files listed in phase 2/3/6 for modularized UI + state + utilities.
- E2E tests listed in phase 9.

## Risks and Mitigations
1. Route redirect breaks existing chat and nav tests.
- Mitigation: migrate nav chat link to `/chat`, update route assertions first, add one redirect assertion test.

2. localStorage schema drift may corrupt old persisted state.
- Mitigation: versioned storage key (`claudekit:prompt-optimizer:v2`), safe parse + fallback reset.

3. Conversation payload can exceed token budget.
- Mitigation: keep sliding window (e.g., last N turns), truncate long assistant bodies, preserve latest optimized output priority.

4. Hydration mismatch risk with localStorage-derived initial state.
- Mitigation: initialize with empty shell, hydrate in `useEffect`, show skeleton until restored.

5. Mobile drawer and desktop sidebar behavior conflicts.
- Mitigation: split responsive behavior by breakpoint + single source of truth for panel open state.

6. Diff rendering complexity hurts performance on long prompts.
- Mitigation: simple line/token diff only, cap diff length and fallback to plain compare.

## Unresolved Questions
1. Redirect status preference for `/` → `/guide/prompt-optimizer`: `302` (temporary) vs `308` (permanent)?
2. Should `Enter` still submit (legacy behavior) or strictly use `Ctrl+Enter` only?
3. Keep direct Fireworks call in browser for this flow, or route via internal API for better key control/logging?
