# Command Strategy Decision (2026-04-14)

## Scope
- Work context: `D:/project/Clone/ck/claudekit-chatbot-astro`
- Inputs confirmed:
  - Engineer raw source: `D:/project/Clone/ck/claudekit-engineer/.claude-archived/commands` (47)
  - Marketing raw source: `D:/project/Clone/ck/claudekit-marketing/.claude/commands` (78)
  - Current chatbot curated catalog: 62

## 1) Definitive Source-of-Truth Policy (Decision)

### Final decision (effective now)
- Marketing SoT: keep `claudekit-marketing/.claude/commands` as canonical live source.
- Engineer SoT for chatbot ingestion: keep `claudekit-engineer/.claude-archived/commands` as canonical source **for now**.
- Do **not** block phase 2 waiting for engineer folder rename/move.

### Why this decision
- Current engineer command inventory is complete and stable in archived path (47 files).
- Immediate cutover without parity checks risks missing aliases/semantics and breaks ranking quality.
- Product goal is reduce user overload now; ingestion stability is more important than directory naming purity.

### Migration path (locked)
1. Phase A (now): Dual-source metadata policy
- Engineer primary: `.claude-archived/commands`
- Marketing primary: `.claude/commands`
- Every ingested command must keep provenance: repo, file path, command id, alias list.

2. Phase B (when engineer live folder exists): Shadow sync window
- Read both engineer sources in comparison mode.
- Cutover gate: >=95% command-id parity + alias diff reviewed + no high-risk missing command.

3. Phase C (cutover)
- Switch engineer canonical source to `.claude/commands`.
- Keep archived path as fallback for 1 release cycle, then retire.

## 2) Curated vs Progressive Reveal Policy (Decision)

### Final decision
- Adopt **Curated-first + Progressive Reveal**.
- Keep curated 62 as default surface.
- Reveal from full raw pool (125) only via intent-ranked controlled expansion.

### Guardrails
1. Result tiers
- Tier 1: curated core (default)
- Tier 2: raw-validated add-ons (intent confidence high)
- Tier 3: expert/expanded list (explicit user action)

2. Ranking and exposure limits
- Palette top list cap: 8 items.
- Non-curated exposure cap in top list: max 3 items.
- Only show Tier 2 when intent confidence >= 0.72.
- New/empty sessions: first 3 interactions show curated only.

3. Eligibility filters for raw commands
- Must have: clear description, use-case, source provenance, normalized canonical id.
- Must pass dedupe/alias normalization.
- Exclude deprecated/ambiguous commands from auto-suggest.

4. Safety and trust
- Never auto-execute raw/unfamiliar commands.
- Show source badge (`Engineer`/`Marketing`) + short purpose text.
- Provide fallback “best curated alternative” when confidence is low.

5. Promotion policy (raw -> curated)
- Promote when a raw command meets threshold over rolling window:
  - High selection rate
  - High completion success
  - Low immediate fallback/retry
- Demote curated commands with persistent low utility.

## 3) Operational Policy Snapshot
- Catalog strategy: `curated-core (62)` + `raw-pool (125)`
- UX strategy: minimize choice overload, reveal depth only when signal is strong
- Data strategy: provenance + canonical id + alias normalization mandatory
- Delivery strategy: no blocking migration; stabilize now, migrate engineer source safely later

## 4) Concrete Next Execution Moves
1. Keep current curated runtime behavior as baseline.
2. Enable progressive reveal using intent score and exposure caps above.
3. Track telemetry for promotion/demotion loop.
4. Open engineer source cutover only after parity gate is satisfied.

## Unresolved Questions
None
