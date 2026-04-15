# Code Standards

**Version:** 0.0.2  
**Last Updated:** 2026-04-15

---

## File Naming Conventions

### Primary Rule: Descriptive Kebab-Case
All files must use kebab-case with long, descriptive names that explain their purpose at a glance.

```
// GOOD - Self-documenting file names
command-browser-with-kit-filter-and-search.tsx
use-favorites-with-local-storage-persistence.ts
native-sqlite-database-client.ts
animation-variants-for-framer-motion.ts
workflow-recommendation-engine.ts

// BAD - Too short, requires reading content
command-browser.tsx
use-favorites.ts
sqlite-client.ts
animations.ts
workflows.ts
```

### Naming Patterns by Type

| Type | Pattern | Example |
|------|---------|---------|
| Components | `component-name-with-features.tsx` | `chat-input-with-keyboard-shortcuts.tsx` |
| Hooks | `use-feature-with-capability.ts` | `use-command-search-with-debounce.ts` |
| Library | `purpose-implementation-detail.ts` | `firepass-client-with-streaming.ts` |
| Utils | `utility-purpose.ts` | `string-formatting-utils.ts` |
| Styles | `scope-styles.css` | `global.css` |

---

## Component Architecture

### 1. File Size Limit
Keep components under 200 lines. Split when exceeding:

```
// Split large components into focused sub-components
chat-frame-with-glassmorphism-and-vietnamese.tsx (240 lines)
  -> chat-header-with-status.tsx (60 lines)
  -> message-bubble-user-simple.tsx (30 lines)
  -> message-bubble-assistant-with-actions.tsx (50 lines)
  -> chat-input-with-keyboard-shortcuts.tsx (80 lines)
```

### 2. Composition Over Inheritance
Build complex UIs by composing small, focused components:

```tsx
// GOOD - Composition pattern
<ChatFrame>
  <ChatHeader status={status} />
  <MessageList>
    {messages.map(m => m.role === 'user' 
      ? <UserMessage key={m.id} content={m.content} />
      : <AssistantMessage key={m.id} content={m.content} />
    )}
  </MessageList>
  <ChatInput onSend={handleSend} />
</ChatFrame>

// BAD - Monolithic component with all logic inline
<ChatEverything messages={messages} status={status} onSend={handleSend} />
```

### 3. Props Interface Pattern
Always define explicit TypeScript interfaces for props:

```tsx
interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isStreaming?: boolean;
  placeholder?: string;
}

export function ChatInput({ 
  value, 
  onChange, 
  onSend, 
  isStreaming = false, 
  placeholder = "Type a message..." 
}: ChatInputProps) {
  // Implementation
}
```

---

## Glassmorphism Design System

### Global Accent and Locale Policy

- **One accent only:** use `brand-*` for product emphasis across pages.
- Do not introduce new primary accent families for actions/navigation.
- Status semantics (success/warning/error) are allowed only for state feedback.
- UI text in active surfaces must support bilingual toggle (`vi` and `en`).
- Source of truth for UI copy keys: `src/lib/bilingual-language-toggle-translations.ts`.

### CSS Variables (Design Tokens)
All glassmorphism values are defined in `src/styles/global.css`:

```css
/* Glass Depth Layers */
--glass-depth-1: rgba(255, 255, 255, 0.03);   /* Subtle */
--glass-depth-2: rgba(255, 255, 255, 0.06);   /* Standard cards */
--glass-depth-3: rgba(255, 255, 255, 0.10);   /* Elevated */
--glass-depth-4: rgba(255, 255, 255, 0.15);   /* Highlights */
--glass-depth-5: rgba(255, 255, 255, 0.20);   /* Max emphasis */

/* Border Opacity Scale */
--glass-border-1: rgba(255, 255, 255, 0.05);
--glass-border-2: rgba(255, 255, 255, 0.10);
--glass-border-3: rgba(255, 255, 255, 0.15);
--glass-border-4: rgba(255, 255, 255, 0.25);

/* Blur Levels */
--blur-xs: 4px;
--blur-sm: 8px;
--blur-md: 16px;
--blur-lg: 24px;
--blur-xl: 40px;

/* Brand Colors */
--brand-300: #f5a623;  /* Primary brand */
--brand-400: #e08e1a;
--brand-500: #c77812;
```

### Component Classes

| Class | Purpose |
|-------|---------|
| `.glass-card` | Base glass card with hover effects |
| `.glass-card-depth-{1-4}` | Depth variants |
| `.animated-border` | Rotating hue gradient border |
| `.glass-button` | Standard glass button |
| `.glass-button-primary` | Brand-accented button |
| `.glow-brand` | Brand-colored glow effect |
| `.text-gradient` | Purple-to-orange gradient text |

### Tailwind Pattern

```tsx
// Standard glassmorphism component structure
<div className="
  bg-gray-900/70           /* Semi-transparent dark bg */
  backdrop-blur-md         /* Blur level */
  border border-gray-700/50 /* Subtle border */
  rounded-xl               /* Rounded corners */
  hover:border-gray-600/50 /* Hover state */
  transition-colors        /* Smooth transition */
">
```

---

## TypeScript Patterns

### 1. Strict Type Safety
Enable strict mode in tsconfig.json and enforce types:

```ts
// GOOD - Explicit types
function filterCommands(commands: Command[], filter: KitFilter): Command[] {
  return commands.filter(c => filter === 'all' || c.category === filter);
}

// BAD - Implicit any
function filterCommands(commands, filter) {
  return commands.filter(c => filter === 'all' || c.category === filter);
}
```

### 2. Interface Naming

| Pattern | Example |
|---------|---------|
| Data entities | `ChatSession`, `Message`, `Command` |
| Props | `ComponentNameProps` |
| State | `ComponentNameState` |
| Hook returns | `UseHookNameReturn` |
| Events | `EventNameEvent` |

### 3. Discriminated Unions
Use for state machines:

```ts
type ChatAction =
  | { type: 'SEND_MESSAGE'; payload: string }
  | { type: 'APPEND_CHUNK'; payload: string }
  | { type: 'SET_STATUS'; payload: ChatStatus }
  | { type: 'SET_ERROR'; payload: Error }
  | { type: 'STOP_STREAMING' }
  | { type: 'SET_INPUT'; payload: string };
```

### 4. Utility Types

```ts
// Use built-in utility types
type PartialCommand = Partial<Command>;
type RequiredCommand = Required<Command>;
type CommandKeys = keyof Command;
type CommandValues = Command[CommandKeys];
```

---

## State Management Patterns

### 1. Hooks for Local State

```ts
// Single-purpose hooks with clear API
function useDebounce<T>(value: T, delay: number = 150): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
}
```

### 2. Context for Global State
Use reducer pattern for complex state:

```tsx
// Context definition
interface ChatState {
  messages: UIMessage[];
  status: ChatStatus;
  error: Error | null;
  input: string;
}

const ChatContext = createContext<{
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
} | null>(null);

// Provider component
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  return (
    <ChatContext.Provider value={{ state, dispatch }}>
      {children}
    </ChatContext.Provider>
  );
}

// Consumer hook
export function useChatContext() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChatContext must be used within ChatProvider');
  return context;
}
```

### 3. Persistence Pattern
For localStorage-backed state:

```ts
function useFavoritesWithLocalStoragePersistence() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('claudekit:favorites');
    return stored ? JSON.parse(stored) : [];
  });
  
  useEffect(() => {
    localStorage.setItem('claudekit:favorites', JSON.stringify(favorites));
  }, [favorites]);
  
  const toggleFavorite = useCallback((commandId: string) => {
    setFavorites(prev => 
      prev.includes(commandId) 
        ? prev.filter(id => id !== commandId)
        : [...prev, commandId]
    );
  }, []);
  
  return { favorites, toggleFavorite, isFavorite: (id) => favorites.includes(id) };
}
```

---

## Error Handling

### 1. Try-Catch Pattern
Always wrap external API calls:

```ts
async function optimizePrompt(prompt: string): Promise<OptimizeResult> {
  try {
    const response = await fetch('/api/optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Failed to optimize prompt:', error);
    throw new OptimizeError('Prompt optimization failed', { cause: error });
  }
}
```

### 2. Graceful Degradation
Database unavailable fallback:

```ts
export async function getSessions(limit = 50): Promise<ChatSession[]> {
  if (!isDatabaseAvailable()) {
    console.warn('Database unavailable, returning empty sessions');
    return [];
  }
  // ... query logic
}
```

### 3. User-Facing Errors
Convert technical errors to user-friendly messages:

```ts
const errorMessages: Record<string, string> = {
  'RATE_LIMIT_EXCEEDED': 'Too many requests. Please wait a moment.',
  'INVALID_API_KEY': 'API configuration error. Contact support.',
  'NETWORK_ERROR': 'Connection failed. Check your internet.',
  'DB_UNAVAILABLE': 'History temporarily unavailable. Chat will continue.'
};
```

---

## Testing Standards

### 1. File Organization
```
tests/
├── unit/                    # Unit tests
│   ├── components/
│   ├── hooks/
│   └── lib/
├── integration/             # Integration tests
│   └── api/
└── setup.ts                 # Test setup
```

### 2. Test Naming
```
ComponentName.spec.tsx       # Component tests
hook-name.spec.ts            # Hook tests
module-name.spec.ts          # Library tests
```

### 3. Test Structure
```ts
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('CommandBrowser', () => {
  it('should filter commands by kit category', () => {
    render(<CommandBrowser commands={mockCommands} />);
    // Test logic
  });
  
  it('should display empty state when no results', () => {
    // Test logic
  });
});
```

---

## Import Conventions

### 1. Order
```tsx
// 1. React/Node built-ins
import { useState, useEffect } from 'react';
import { randomUUID } from 'crypto';

// 2. Third-party
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

// 3. Absolute project imports
import { ChatMessage } from '@/types/chat';
import { db } from '@/lib/db';

// 4. Relative imports (avoid when possible)
import { useToast } from '../hooks/use-toast';
```

### 2. Path Aliases
Configured in `tsconfig.json` and `astro.config.mjs`:

| Alias | Path |
|-------|------|
| `@/*` | `./src/*` |
| `@lib/*` | `./src/lib/*` |
| `@components/*` | `./src/components/*` |
| `@middleware/*` | `./src/middleware/*` |

---

## Accessibility (a11y)

### Required Attributes

| Element | Required Attributes |
|---------|---------------------|
| Interactive | `aria-label` or `aria-labelledby` |
| Loading states | `aria-busy`, `aria-live` |
| Dynamic content | `aria-live` (polite/assertive) |
| Modal/dialog | `role="dialog"`, `aria-modal` |
| Form inputs | `aria-invalid`, `aria-describedby` |

### Example
```tsx
<button 
  aria-label="Copy to clipboard"
  aria-pressed={copied}
  onClick={handleCopy}
>
  <CopyIcon />
</button>

<div aria-live="polite" aria-atomic="true">
  {notification && <Toast message={notification} />}
</div>
```

### Reduced Motion
```tsx
import { useReducedMotion } from 'framer-motion';

function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
    />
  );
}
```

---

## Documentation Comments

### JSDoc for Public APIs
```ts
/**
 * Recommends commands based on user input using keyword matching
 * and complexity scoring.
 * 
 * @param input - The user's natural language input
 * @param commands - Array of available commands to search
 * @returns Array of scored recommendations, sorted by relevance
 * 
 * @example
 * ```ts
 * const recommendations = recommendCommands(
 *   "fix this bug",
 *   [debugCommand, fixCommand]
 * );
 * ```
 */
export function recommendCommands(
  input: string, 
  commands: Command[]
): CommandRecommendation[] {
  // Implementation
}
```

---

## Git Conventions

### Commit Messages
Use conventional commits:

```
feat: add prompt optimizer with templates
fix: resolve SSE streaming buffer overflow
refactor: extract chat input to separate component
docs: update API endpoint documentation
test: add unit tests for command recommender
chore: update dependencies to latest versions
```

### Pre-commit Checklist
1. Run `npm test` - All tests pass
2. Run type check - No TypeScript errors
3. Review changes - No console.logs or debug code
4. Check imports - No unused imports
