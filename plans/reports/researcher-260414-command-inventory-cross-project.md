# Command Inventory Cross-Project (2026-04-14)

## Scope
- `D:\project\Clone\ck\claudekit-engineer`
- `D:\project\Clone\ck\claudekit-marketing`

## Where Commands Live
- Engineer: `D:\project\Clone\ck\claudekit-engineer\.claude-archived\commands` (47 command markdown files)
- Marketing: `D:\project\Clone\ck\claudekit-marketing\.claude\commands` (78 command markdown files)

## High-Level Counts
- Engineer raw files: 47
- Marketing raw files: 78
- Total raw command files across two repos: 125
- Current chatbot catalog (`src/data/claudekit-full-commands-catalog.ts`): 62 curated commands

## Engineer Command Groups (top by folder)
- `fix/*`: 8
- `design/*`: 6
- `skill/*`: 6
- `plan/*`: 6
- `content/*`: 4
- `code/*`: 3
- `cook/*`: 3
- `bootstrap/*`: 3
- root commands: `bootstrap`, `code`, `cook`, `debug`, `fix`, `plan`, `scout`

## Marketing Command Groups (under `/ckm/*`)
- `write/*`: 9
- `plan/*`: 8
- `skill/*`: 7
- `campaign/*`: 4
- `docs/*`: 4
- `play/*`: 4
- `storage/*`: 4
- `seo/*`: 3
- `video/*`: 3
- `youtube/*`: 3
- plus root `ckm` commands: `ask`, `analyze`, `campaign`, `competitor`, `dashboard`, `email`, `funnel`, `hub`, `init`, `journal`, `kanban`, `persona`, `plan`, `play`, `preview`, `seo`, `social`, `use-mcp`, `watzup`, `worktree`

## Practical Effect on Chatbot Recommender
- Raw command files include many variants and nested aliases.
- Chatbot currently uses a curated catalog to avoid overload and keep intent mapping stable.
- Gap between 125 raw files and 62 curated commands is expected but needs periodic sync.

## Recommendation for Next Sync
- Build a script to ingest both command trees, normalize aliases, and emit one deduplicated catalog with:
  - canonical command
  - aliases/variants
  - concise intent keywords
  - source repo + source file path
- Then regenerate `src/data/claudekit-full-commands-catalog.ts` from this generated artifact.

## Unresolved Questions
- Should engineer source of truth move from `.claude-archived/commands` to a non-archived live folder before auto-sync?
- Should chatbot expose all 125 raw commands or keep curated mode (62) + progressive reveal?
