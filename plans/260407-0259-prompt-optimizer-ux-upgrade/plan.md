---
title: "Prompt Optimizer UX Upgrade Plan"
description: "Comprehensive UX improvements for the Claude Code Prompt Optimizer tool"
status: pending
priority: P2
effort: 12h
branch: main
tags: [ux, ui, enhancement, prompt-optimizer]
created: 2026-04-07
---

# Prompt Optimizer UX Upgrade Plan

## Current State Analysis

### Current UX Limitations

| Limitation | Impact | Severity |
|------------|--------|----------|
| Simple textarea input | No auto-expand, poor for long prompts | Medium |
| No templates/quick starters | Users start from scratch every time | High |
| Raw markdown output | No syntax highlighting, hard to scan | Medium |
| No structured result display | Mixed content (optimized prompt + command + explanation) | High |
| No side-by-side comparison | Can't easily see what changed | High |
| No history/session persistence | Lose work on refresh | Medium |
| Copy copies everything | Can't copy just the optimized prompt or just command | High |
| No export/save options | Limited sharing capabilities | Low |

### Current Architecture

```
PromptOptimizerChat Component
├── State: messages[], input, isLoading, copiedId
├── System prompt for AI optimization
├── Simple chat UI (avatar, message bubbles)
├── Basic actions: Send, Copy, Reset
└── Quick prompt examples (4 static examples)
```

## Proposed UX Improvements

### Phase 1: Enhanced Input Experience (3h)

#### 1.1 Expandable Input Area
- Auto-expand textarea (max 10 rows)
- Character count indicator
- Full-screen edit mode (modal) for long prompts
- Placeholder improvements with dynamic examples

#### 1.2 Prompt Templates Library
Create template categories:
- **Development**: `Tạo component React...`, `Refactor code...`, `Fix lỗi TypeScript...`
- **UI/UX**: `Thiết kế UI cho...`, `Làm responsive cho...`, `Thêm animation...`
- **DevOps**: `Deploy lên...`, `Cấu hình CI/CD...`, `Dockerize app...`
- **Database**: `Tạo migration...`, `Optimize query...`, `Thiết kế schema...`

Template selector UI:
- Dropdown or horizontal scroll
- Search/filter templates
- Recent/favorite templates

#### 1.3 Input Enhancements
- Undo/redo support (Ctrl+Z / Ctrl+Shift+Z)
- Clear button (X) when input has content
- Paste from clipboard button

### Phase 2: Improved Result Display (4h)

#### 2.1 Structured Output Parsing
Parse AI response into structured sections:

```typescript
interface OptimizedResult {
  originalPrompt: string;
  optimizedPrompt: string;
  suggestedCommand: {
    name: string;
    description: string;
    reason: string;
  };
  improvements: string[]; // List of what was improved
  metadata: {
    timestamp: number;
    model: string;
    tokensUsed?: number;
  };
}
```

#### 2.2 Tabbed Result Interface
Three-tab layout for results:

```
┌─────────────────────────────────────────────┐
│  Optimized Prompt  │  Command  │  Compare  │
├─────────────────────────────────────────────┤
│                                             │
│  [Content based on selected tab]           │
│                                             │
└─────────────────────────────────────────────┘
```

**Tab 1 - Optimized Prompt:**
- Syntax highlighting for code blocks
- One-click copy button (top right)
- One-click "Apply to Chat" button
- Collapsible sections if prompt is long

**Tab 2 - Command:**
- Command badge with color coding per command type
- Command description
- Why this command was suggested
- One-click copy command button

**Tab 3 - Comparison:**
- Side-by-side diff view (Original | Optimized)
- Highlight changes (added/removed/changed)
- Inline or split diff modes

#### 2.3 Syntax Highlighting
Add `prism-react-renderer` or `react-syntax-highlighter`:
- Highlight code blocks in optimized prompts
- Language auto-detection
- Copy button per code block

### Phase 3: One-Click Actions (2h)

#### 3.1 Apply Optimized Prompt
- "Apply to Chat" button next to optimized result
- Opens chat with pre-filled optimized prompt
- Route: `/chat?prompt={optimized}`

#### 3.2 Command Quick Actions
- "Copy Command" - copies just the command
- "Run Command" - executes the command directly (if applicable)
- "Learn More" - links to command documentation

#### 3.3 Feedback Loop
- Thumbs up/down on results
- "Regenerate" button for unsatisfactory results
- Optional: feedback text input

### Phase 4: History & Persistence (2h)

#### 4.1 Local Storage History
```typescript
interface HistoryItem {
  id: string;
  timestamp: number;
  originalPrompt: string;
  optimizedPrompt: string;
  command: string;
  starred: boolean;
}
```

Features:
- Save last 50 optimizations
- Search history
- Star/favorite items
- Delete individual items or clear all

#### 4.2 History Sidebar
- Collapsible sidebar (right side)
- List view with preview
- Click to reload result
- Export selected items

### Phase 5: Export & Sharing (1h)

#### 5.1 Export Options
- Export as Markdown file
- Export as JSON (for backup)
- Copy as formatted text

#### 5.2 Share Features
- Share via URL (if implementing server-side storage)
- Copy shareable link (for specific optimization)

## Implementation Plan

### Files to Modify
1. `src/components/command-guide/prompt-optimizer-chat.tsx` - Major refactor
2. `src/pages/guide/prompt-optimizer.astro` - Minor layout adjustments

### Files to Create
1. `src/components/command-guide/prompt-templates.ts` - Template definitions
2. `src/components/command-guide/optimized-result-view.tsx` - Result display component
3. `src/components/command-guide/diff-view.tsx` - Comparison view
4. `src/components/command-guide/history-panel.tsx` - History sidebar
5. `src/hooks/use-prompt-history.ts` - History management hook
6. `src/utils/prompt-parser.ts` - Response parsing utility

### Dependencies to Add
```json
{
  "prism-react-renderer": "^2.4.1",
  "react-diff-viewer": "^3.1.1" // or custom diff implementation
}
```

### Component Architecture

```
PromptOptimizerChat (container)
├── InputSection
│   ├── ExpandableTextarea
│   ├── TemplateSelector
│   └── ActionButtons (Clear, Fullscreen, Submit)
├── ResultSection (shown after optimization)
│   ├── TabNavigation
│   ├── OptimizedPromptTab
│   │   ├── SyntaxHighlightedCode
│   │   ├── CopyButton
│   │   └── ApplyButton
│   ├── CommandTab
│   │   ├── CommandBadge
│   │   ├── Description
│   │   └── Copy/Run buttons
│   └── ComparisonTab
│       └── DiffViewer (Original vs Optimized)
└── HistorySidebar (collapsible)
    ├── HistoryList
    ├── Search/Filter
    └── ExportActions
```

### UI/UX Specifications

#### Colors (consistent with existing design)
- Primary: blue-500/600
- Secondary: purple-500/600
- Success: green-500/600
- Warning: yellow-500/600
- Error: red-500/600

#### Animations
- Smooth tab transitions (300ms ease)
- Expand/collapse animations
- Loading state with pulse effect
- Copy feedback animation

#### Responsive Behavior
- Desktop: Full 3-column layout (Input | Result | History)
- Tablet: 2-column (Input/Result + collapsible History)
- Mobile: Stacked, tabs become bottom sheet

## Success Criteria

1. Input area auto-expands and supports full-screen editing
2. Users can select from 12+ prompt templates across 4 categories
3. Results display in 3-tab interface with syntax highlighting
4. Side-by-side comparison shows clear diff between original/optimized
5. One-click copy for optimized prompt and command separately
6. One-click apply sends optimized prompt to chat
7. History persists across sessions (localStorage)
8. Users can export results as Markdown
9. Zero regression in existing functionality

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI response parsing fails | High | Robust parsing with fallback to raw display |
| localStorage quota exceeded | Medium | Limit history items, add LRU eviction |
| Bundle size increase | Medium | Code-splitting for diff viewer and syntax highlighter |
| Mobile UX complexity | Medium | Thorough mobile testing, simplified mobile layout |

## Unresolved Questions

1. Should we implement server-side storage for cross-device history sync?
2. Should we add user accounts to enable personalized templates?
3. Should the diff view show character-level or word-level differences?
4. What format should the exported Markdown file use?

---

**Estimated Total Effort:** 12 hours
**Phases can be implemented independently:** Yes, recommended order: 1 → 2 → 3 → 4 → 5
