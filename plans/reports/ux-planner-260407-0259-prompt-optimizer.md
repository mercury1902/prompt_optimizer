# Prompt Optimizer UX Upgrade - Analysis Report

**ux-planner-260407-0259-prompt-optimizer**

## Current Implementation Summary

Analyzed files:
- `src/components/command-guide/prompt-optimizer-chat.tsx` (296 lines)
- `src/pages/guide/prompt-optimizer.astro` (68 lines)

### Current Features
- Chat-style interface with message bubbles
- System prompt for AI-powered optimization
- Copy button for results
- Reset button
- 4 static quick prompt examples
- API integration with Fireworks AI

### Identified Limitations

| # | Limitation | User Impact |
|---|------------|-------------|
| 1 | Fixed 2-row textarea | Poor for editing long prompts |
| 2 | No templates | Users start blank every time |
| 3 | Raw markdown display | Hard to read code blocks |
| 4 | Unstructured output | Can't easily extract just the prompt or command |
| 5 | No comparison view | Can't see what was changed |
| 6 | No history | Lose work on refresh |
| 7 | Copy copies everything | Must manually select desired text |
| 8 | No apply action | Must manually copy-paste to chat |

## Proposed Improvements

### Phase 1: Enhanced Input (3h)
- Auto-expanding textarea (up to 10 rows)
- Full-screen edit mode
- Template library (12+ templates, 4 categories)
- Clear/undo/redo actions

### Phase 2: Result Display (4h)
- Tabbed interface: Optimized | Command | Compare
- Syntax highlighting for code blocks
- Side-by-side diff view
- Structured parsing of AI response

### Phase 3: One-Click Actions (2h)
- "Apply to Chat" button (routes to /chat with pre-filled prompt)
- Separate copy buttons for prompt vs command
- Feedback (thumbs up/down + regenerate)

### Phase 4: History (2h)
- localStorage persistence (50 items)
- History sidebar with search/filter
- Star/favorite items

### Phase 5: Export (1h)
- Export as Markdown
- Export as JSON backup

## Architecture Changes

### New Components
- `expandable-textarea.tsx`
- `template-selector.tsx`
- `optimized-result-view.tsx`
- `diff-viewer.tsx`
- `history-panel.tsx`

### New Hooks
- `use-prompt-history.ts`

### New Utilities
- `prompt-parser.ts`

### Dependencies
- `prism-react-renderer` (syntax highlighting)
- `react-diff-viewer` or custom diff

## Effort Estimate

**Total: 12 hours**
- Phase 1: 3h
- Phase 2: 4h
- Phase 3: 2h
- Phase 4: 2h
- Phase 5: 1h

Phases are independent and can be implemented sequentially.

## Plan Location

`D:/project/Clone/ck/claudekit-chatbot-astro/plans/260407-0259-prompt-optimizer-ux-upgrade/plan.md`

**Status:** DONE
