# Data Files and Types Analysis Report
**Generated:** 2026-04-07  
**Scope:** Core data structures, types, and constants  
**Files Analyzed:** 9

---

## 1. Command System Data

### Core Data Structure: Command
```typescript
interface Command {
  id: string;                    // Unique identifier (e.g., "ck:cook")
  name: string;                  // Display name (e.g., "/ck:cook")
  category: string;              // "Engineer" | "Marketing"
  complexity: 1 | 2 | 3 | 4 | 5; // 1-5 scale
  description: string;           // Human-readable description
  keywords: string[];            // Search terms (multilingual: EN + VN)
  patterns: string[];           // Regex patterns for matching
  useCases: string[];          // When to use this command
  args?: string;                // Expected arguments
  variants?: string[];           // Alternative command forms
}
```

### Data Constants
| Constant | Type | Count | Description |
|----------|------|-------|-------------|
| engineerCommands | Command[] | 28 | Engineering-focused commands |
| marketingCommands | Command[] | 34 | Marketing-focused commands |
| commands | Command[] | 62 | Combined catalog |
| categories | string[] | 2 | ["Engineer", "Marketing"] |

### Key Data Patterns
- Multilingual keywords: Commands searchable in English and Vietnamese
- Complexity-based UX: Commands display with lightning bolts matching complexity level
- Variant expansion: Commands have multiple forms (e.g., /ck:fix -> /ck:fix:auto)

---

## 2. Chat System Types

### Core Interfaces

#### Message System
| Interface | Purpose | Key Fields |
|-----------|---------|------------|
| UIMessage | UI message display | id, role, content, tool_calls[] |
| ToolExecution | Tool call tracking | toolCallId, status, result, duration |
| ChatState | React state container | messages[], status, error, input |

#### State Machine: ChatStatus
type ChatStatus = 'idle' | 'submitted' | 'streaming' | 'error';

#### Action Types (Reducer Pattern)
type ChatAction =
  | { type: 'SEND_MESSAGE'; payload: string }
  | { type: 'APPEND_CHUNK'; payload: string }
  | { type: 'SET_STATUS'; payload: ChatStatus }
  | { type: 'SET_ERROR'; payload: Error }
  | { type: 'STOP_STREAMING' }
  | { type: 'SET_INPUT'; payload: string };

---

## 3. Database Schema

### Entity Models

#### ChatSession
| Field | Type | SQLite Type |
|-------|------|-------------|
| id | string | TEXT PRIMARY KEY |
| title | string | TEXT |
| createdAt | Date | INTEGER (epoch) |
| updatedAt | Date | INTEGER (epoch) |
| model | string? | TEXT |

#### Message
| Field | Type | SQLite Type |
|-------|------|-------------|
| id | string | TEXT PRIMARY KEY |
| sessionId | string | TEXT (FK) |
| role | MessageRole | TEXT |
| content | string | TEXT |
| createdAt | Date | INTEGER |
| toolCalls | ToolCallData[]? | TEXT (JSON) |
| toolResults | ToolResultData[]? | TEXT (JSON) |
| isComplete | boolean? | INTEGER |

### Schema Configuration
- Foreign Key: messages.sessionId -> chat_sessions.id (CASCADE DELETE)
- Indexes: idx_messages_session_id, idx_messages_created_at, idx_sessions_updated_at

---

## 4. Workflow System

### Core Types

#### WorkflowStep
```typescript
interface WorkflowStep {
  step: number;
  command: string;
  description: string;
  flags?: string[];
  required?: boolean;
  gateway?: boolean;
  note?: string;
}
```

#### Workflow
```typescript
interface Workflow {
  id: string;
  name: string;
  description: string;
  kit: "engineer" | "marketing" | "both";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  timeEstimate: string;
  steps: WorkflowStep[];
  useCases: string[];
  keywords: string[];
}
```

#### Recommendation Types
```typescript
type SmartRecommendation = 
  | WorkflowRecommendation 
  | CommandSequenceRecommendation;
```

### Workflow Registry (18 Workflows)
| Category | Count | Examples |
|----------|-------|----------|
| Engineer | 6 | new-feature, bootstrap-project, bug-fix |
| Marketing | 5 | content-creation, campaign-launch, seo-content |
| Hybrid | 2 | fullstack-feature |

---

## 5. Prompt Templates

### Data Structure
```typescript
interface PromptTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  content: string;
}

type TemplateCategory = 'Development' | 'UI/UX' | 'DevOps' | 'Database';
```

### Template Registry (14 Templates)
| Category | Count |
|----------|-------|
| Development | 4 |
| UI/UX | 4 |
| DevOps | 3 |
| Database | 3 |

---

## 6. Response Parser

### Data Structure
```typescript
interface ParsedPromptResult {
  optimizedPrompt: string;
  suggestedCommand: string;
  explanation: string;
  rawContent: string;
}
```

### Parsing Format
Expected AI response format with emoji markers:
- Prompt optimized: emoji marker
- Command suggestion: lightbulb marker
- Explanation: target marker

---

## Cross-Cutting Type Relationships

### Type Mapping Matrix
| Domain | Core Type | Persistence | UI Representation |
|--------|-----------|-------------|-------------------|
| Commands | Command | - | Command cards |
| Messages | UIMessage | Message (DB) | Chat bubbles |
| Workflows | Workflow | - | Workflow browser |
| Templates | PromptTemplate | - | Template selector |
| Tool Calls | ToolExecution | ToolCallData/ToolResultData | Status badges |

---

## Unresolved Questions

1. Database migrations: Current schema uses placeholder validation schemas
2. Command variants: Variants stored as strings, could benefit from typed structures
3. Workflow scoring: Confidence number lacks defined thresholds
4. Tool call persistence: JSON serialization utilities needed

---

**Status:** DONE  
**Report Location:** D:/project/Clone/ck/claudekit-chatbot-astro/plans/reports/scout-data-types-260407-1156-report.md
