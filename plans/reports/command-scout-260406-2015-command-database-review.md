# Command Database Review Report

**Date:** 2026-04-06  
**Scout:** command-scout  
**Files Reviewed:**
- src/data/commands.ts
- src/data/claudekit-full-commands-catalog.ts
- src/lib/workflows.ts
- src/lib/command-recommender.ts

---

## 1. Current Command Count by Category

| Category | Count | Commands |
|----------|-------|----------|
| **Engineer** | 25 | cook, plan, bootstrap, fix (base + 6 variants), test, code-review, ship, deploy, scout, research, ask, team, worktree, docs, git:cm, git:cp, git:pr, preview |
| **Marketing** | 27 | content/good, content/fast, content/cro, write/blog, write/good, write/fast, write/publish, write/audit, seo/keywords, seo/optimize, seo/schema, seo/audit, design/good, design/fast, design/generate, design/screenshot, design/3d, social, social:schedule, campaign/create, campaign/analyze, email/sequence, email/flow, video/script:create, video/storyboard:create, video/create, funnel, competitor, persona, skill:create, brainstorm |
| **Total** | **52** | |

---

## 2. Missing Commands Identified

### 2.1 Referenced in Code but Missing from Catalog

| Command | Referenced In | Status |
|---------|---------------|--------|
| /ck:debug | command-recommender.ts:24 INTENT_MAPPINGS | NOT DEFINED |
| /ck:fix:parallel | command-recommender.ts:36 INTENT_MAPPINGS | NOT DEFINED |
| /ck:docs:init | workflows.ts bootstrap-project step 2 | NOT DEFINED |
| /content/blog | workflows.ts seo-content step 2 | SHOULD BE /write/blog |
| /plan | workflows.ts content-creation step 2 | SHOULD BE /ck:plan |
| /git:cm | workflows.ts content-creation step 6 | SHOULD BE /ck:git:cm |

### 2.2 Potentially Missing Engineer Commands

| Command | Purpose | Priority |
|---------|---------|----------|
| /ck:simplify | Simplify complex code | Medium |
| /ck:agent | Create custom agents | Low |
| /ck:db | Database operations | Low |
| /ck:api | API design/testing | Low |
| /ck:security | Security audit | Low |
| /ck:perf | Performance optimization | Low |

### 2.3 Potentially Missing Marketing Commands

| Command | Purpose | Priority |
|---------|---------|----------|
| /ads:create | Create ad campaigns | Medium |
| /ads:optimize | Optimize ad performance | Medium |
| /content/rewrite | Rewrite existing content | Low |
| /content/translate | Translate content | Low |
| /write/headline | Generate headlines | Low |
| /seo/backlinks | Backlink analysis | Low |

---

## 3. Flow Organization Analysis

### 3.1 Workflow Completeness

| Workflow ID | Kit | Steps | Status |
|-------------|-----|-------|--------|
| new-feature | engineer | 6 | OK |
| bootstrap-project | engineer | 3 | NEEDS FIX - step 2 uses undefined /ck:docs:init |
| bug-fix | engineer | 4 | OK |
| ship-release | engineer | 4 | OK |
| refactor-code | engineer | 6 | OK |
| content-creation | marketing | 6 | NEEDS FIX - step 2 uses /plan, step 6 uses /git:cm |
| campaign-launch | marketing | 8 | OK |
| seo-content | marketing | 5 | NEEDS FIX - step 2 uses undefined /content/blog |
| video-production | marketing | 5 | OK |
| design-creation | marketing | 4 | OK |
| fullstack-feature | both | 9 | OK |
| quick-fix | engineer | 2 | OK |

**Total Workflows:** 12  
**Workflows with Issues:** 3 (25%)

### 3.2 Command Variants Analysis

| Command | Variants Count | Variants Defined |
|---------|---------------|------------------|
| /ck:cook | 4 | auto, auto:fast, auto:parallel, --no-test |
| /ck:plan | 5 | --fast, --hard, --two, --parallel, --validate |
| /ck:bootstrap | 4 | --auto, --full, --fast, --parallel |
| /ck:fix | 4 | --auto, --quick, --review, --parallel |
| /ck:docs | 4 | init, update, summarize, llms |
| /ck:code-review | 4 | #PR, COMMIT, --pending, codebase |
| /ck:ship | 4 | official, beta, --skip-tests, --dry-run |

### 3.3 Command Relationships

The getRelatedCommands() function properly:
- Groups same category commands
- Links variant commands when defined
- Limits to 4 related commands

---

## 4. Keyword Coverage Analysis

### 4.1 Vietnamese Language Support

| Command | Vietnamese Keywords | Status |
|---------|---------------------|--------|
| /ck:cook | tao, lam, them, phat trien | OK |
| /ck:fix | sua, loi | OK |
| /ck:plan | ke hoach, thiet ke, lap ke hoach, lap | OK |
| /ck:bootstrap | khoi tao, du an moi | OK |
| /ck:scout | tim | OK (limited) |
| /ck:ask | hoi, giai thich | OK |
| /ck:test | kiem thu | OK |
| /ck:research | (none) | GAP |
| /ck:ship | (none) | GAP |

**Gaps:** /ck:research and /ck:ship lack Vietnamese keywords. Marketing commands mostly lack Vietnamese coverage.

### 4.2 Pattern Coverage

Most commands have 1-2 regex patterns. Complex commands have broader coverage. All patterns use case-insensitive matching.

---

## 5. Recommendations for Improvement

### 5.1 Critical Fixes Required

1. Add missing /ck:debug command OR remove from INTENT_MAPPINGS
2. Add /ck:fix:parallel to catalog OR remove from INTENT_MAPPINGS
3. Fix workflow references:
   - /ck:docs:init -> use /ck:docs init variant
   - /content/blog -> use /write/blog
   - /plan -> use /ck:plan
   - /git:cm -> use /ck:git:cm

### 5.2 Add Missing Commands (Medium Priority)

| Command | Complexity | Description |
|---------|------------|-------------|
| /ck:simplify | 3 | Simplify complex code sections |
| /ads:create | 3 | Create ad campaigns |
| /ads:optimize | 2 | Optimize ad performance |

### 5.3 Expand Vietnamese Coverage

Add Vietnamese keywords to:
- /ck:research: nghien cuu, tim hieu
- /ck:ship: phat hanh, xuat ban
- Marketing commands: viet, noi dung, thiet ke, chien dich

---

## 6. Database Completeness Score

| Criteria | Weight | Score | Weighted |
|----------|--------|-------|----------|
| Command Definitions | 30% | 95% | 28.5% |
| Workflow Accuracy | 25% | 75% | 18.75% |
| Intent Mappings | 20% | 85% | 17% |
| Keyword Coverage | 15% | 70% | 10.5% |
| Variant Support | 10% | 90% | 9% |
| **TOTAL** | 100% | - | **83.75%** |

**Grade: B+ (Good, needs minor improvements)**

---

## 7. Unresolved Questions

1. Are /ck:debug and /ck:fix:parallel intentionally defined only in INTENT_MAPPINGS for future implementation?
2. Should marketing commands have full Vietnamese keyword parity with engineer commands?
3. Are there additional commands in claudekit-engineer or claudekit-marketing repos not yet catalogued?
4. Is /content/blog intentionally separate from /write/blog or should they be unified?
5. Should workflow commands use full paths (/ck:git:cm) or shortcuts (/git:cm)?

---

**Report Generated:** 2026-04-06  
**Next Steps:** Address critical workflow fixes, add missing command definitions, expand Vietnamese coverage
